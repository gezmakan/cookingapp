'use client'

import { useSyncExternalStore, useEffect } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { MealPlanDay } from '@/types/meals'

type MealPlanStore = {
  days: MealPlanDay[] | null
  isLoading: boolean
  error: string | null
}

const store: MealPlanStore = {
  days: null,
  isLoading: true,
  error: null,
}

let listeners: Array<() => void> = []
let pendingFetch: Promise<void> | null = null
let fetchInitialized = false

const notify = () => {
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.push(listener)
  return () => {
    listeners = listeners.filter((l) => l !== listener)
  }
}

const getSnapshot = () => store

// Cached server snapshot to avoid infinite loop
const serverSnapshot: MealPlanStore = {
  days: null,
  isLoading: true,
  error: null,
}

const getServerSnapshot = () => serverSnapshot

let currentUserId: string | null = null
let authListenerInitialized = false

const clearStore = () => {
  store.days = null
  store.isLoading = true
  store.error = null
  pendingFetch = null
  notify()
}

async function fetchMealPlan(supabase: SupabaseClient): Promise<void> {
  if (pendingFetch) {
    return pendingFetch
  }

  pendingFetch = (async () => {
    try {
      store.isLoading = true
      store.error = null
      notify()

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        store.days = null
        store.isLoading = false
        notify()
        return
      }

      // Fetch all days with their meals
      const { data: days, error: daysError } = await supabase
        .from('meal_plan_days')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })

      if (daysError) throw daysError

      // Fetch meals for each day
      const daysWithMeals: MealPlanDay[] = await Promise.all(
        (days || []).map(async (day) => {
          const { data: dayMeals, error: mealsError } = await supabase
            .from('meal_plan_day_meals')
            .select('id, order_index, meal_id')
            .eq('meal_plan_day_id', day.id)
            .order('order_index', { ascending: true })

          if (mealsError) throw mealsError

          // Fetch the actual meal data for each meal_id
          const mealsWithData = await Promise.all(
            (dayMeals || []).map(async (dm) => {
              const { data: meal, error: mealError } = await supabase
                .from('meals')
                .select('*')
                .eq('id', dm.meal_id)
                .single()

              if (mealError) {
                console.error('Error fetching meal:', mealError)
                return null
              }

              return {
                ...meal,
                day_meal_id: dm.id,
                order_index: dm.order_index,
              }
            })
          )

          const meals = mealsWithData.filter((m): m is NonNullable<typeof m> => m !== null)

          return {
            ...day,
            meals,
          }
        })
      )

      store.days = daysWithMeals
      store.isLoading = false
      notify()
    } catch (error) {
      console.error('Error fetching meal plan:', error)
      store.error = error instanceof Error ? error.message : 'Failed to load meal plan'
      store.isLoading = false
      notify()
    } finally {
      pendingFetch = null
    }
  })()

  return pendingFetch
}

export function useMealPlanStore(supabase: SupabaseClient) {
  // Initialize auth listener once
  if (!authListenerInitialized) {
    authListenerInitialized = true

    supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUserId = session?.user?.id ?? null

      if (newUserId !== currentUserId) {
        currentUserId = newUserId

        if (newUserId) {
          clearStore()
          fetchInitialized = false
          await fetchMealPlan(supabase)
        } else {
          clearStore()
          store.isLoading = false
          notify()
        }
      }
    })
  }

  const state = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  // Initialize fetch on first mount using useEffect
  useEffect(() => {
    if (!fetchInitialized) {
      fetchInitialized = true
      fetchMealPlan(supabase)
    }
  }, [supabase])

  const refetch = () => fetchMealPlan(supabase)

  return {
    ...state,
    refetch,
  }
}
