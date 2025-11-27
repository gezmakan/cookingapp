'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { MealPlanDay, Meal } from '@/types/meals'

type DayMealRecord = {
  id: string
  order_index: number
  meal_id: string
  meal_plan_day_id: string
}

type MealPlanState = {
  days: MealPlanDay[]
  isLoading: boolean
  error: string | null
}

const DEFAULT_DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Cache to prevent unnecessary refetches
let cachedData: MealPlanDay[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5000 // 5 seconds - shorter to avoid stale data

export function useMealPlanStore(supabase: SupabaseClient) {
  const [state, setState] = useState<MealPlanState>({
    days: cachedData || [],
    isLoading: !cachedData,
    error: null,
  })

  const isMountedRef = useRef(false)
  const initialLoadRef = useRef(true)
  const defaultDaysSeededRef = useRef(false)
  const isFetchingRef = useRef(false)

  const seedDefaultDays = useCallback(async (userId: string) => {
    const rows = DEFAULT_DAY_NAMES.map((name, idx) => ({
      user_id: userId,
      day_name: name,
      order_index: idx,
      is_active: true,
    }))

    const { error } = await supabase.from('meal_plan_days').insert(rows)
    if (error) throw error
  }, [supabase])

  const fetchPlan = useCallback(async (showLoading: boolean, force: boolean = false) => {
    // Check cache first
    const now = Date.now()
    if (!force && cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      if (isMountedRef.current) {
        setState({
          days: cachedData,
          isLoading: false,
          error: null,
        })
      }
      initialLoadRef.current = false
      return
    }

    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping...')
      return
    }
    isFetchingRef.current = true

    if (showLoading) {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
    } else {
      setState((prev) => ({ ...prev, error: null }))
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      const userId = session?.user?.id

      if (!userId) {
        if (isMountedRef.current) {
          cachedData = []
          lastFetchTime = Date.now()
          setState({
            days: [],
            isLoading: false,
            error: null,
          })
        }
        initialLoadRef.current = false
        defaultDaysSeededRef.current = false
        isFetchingRef.current = false
        return
      }

      const { data: days, error: daysError } = await supabase
        .from('meal_plan_days')
        .select('*')
        .eq('user_id', userId)
        .order('order_index', { ascending: true })

      if (daysError) throw daysError

      const dayIds = (days ?? []).map((day) => day.id)
      let dayMeals: DayMealRecord[] = []

      if ((days ?? []).length === 0 && !defaultDaysSeededRef.current) {
        try {
          defaultDaysSeededRef.current = true
          isFetchingRef.current = false // Reset before recursive call
          await seedDefaultDays(userId)
          await fetchPlan(showLoading, true)
          return
        } catch (seedError) {
          console.error('Error seeding default meal plan days:', seedError)
        }
      }

      if (dayIds.length > 0) {
        const { data: dayMealsData, error: dayMealsError } = await supabase
          .from('meal_plan_day_meals')
          .select('id, order_index, meal_id, meal_plan_day_id')
          .in('meal_plan_day_id', dayIds)
          .order('order_index', { ascending: true })

        if (dayMealsError) throw dayMealsError
        dayMeals = dayMealsData ?? []
      }

      const mealIds = Array.from(new Set(dayMeals.map((dm) => dm.meal_id)))
      const mealsMap = new Map<string, Meal>()

      if (mealIds.length > 0) {
        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .in('id', mealIds)

        if (mealsError) throw mealsError
        mealsData?.forEach((meal) => mealsMap.set(meal.id, meal))
      }

      const daysWithMeals: MealPlanDay[] = (days || []).map((day) => {
        const meals = dayMeals
          .filter((dm) => dm.meal_plan_day_id === day.id)
          .map((dm) => {
            const meal = mealsMap.get(dm.meal_id)
            if (!meal) return null
            return {
              ...meal,
              day_meal_id: dm.id,
              order_index: dm.order_index,
            }
          })
          .filter((m): m is NonNullable<typeof m> => m !== null)

        return {
          ...day,
          meals,
        }
      })

      if (isMountedRef.current) {
        // Update cache
        cachedData = daysWithMeals
        lastFetchTime = Date.now()

        setState({
          days: daysWithMeals,
          isLoading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Error fetching meal plan:', error)
      if (isMountedRef.current) {
        setState({
          days: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load meal plan',
        })
      }
    } finally {
      initialLoadRef.current = false
      isFetchingRef.current = false
    }
  }, [supabase, seedDefaultDays])

  useEffect(() => {
    isMountedRef.current = true
    // Always force fetch on mount to ensure we have fresh data
    fetchPlan(true, false)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchPlan(true, true) // Force refresh on auth changes
    })

    return () => {
      isMountedRef.current = false
      subscription.unsubscribe()
    }
  }, [fetchPlan, supabase])

  const refetch = useCallback(async () => {
    await fetchPlan(initialLoadRef.current, true) // Force refresh on manual refetch
  }, [fetchPlan])

  const updateDayMeals = useCallback((dayId: string, updateFn: (meals: MealPlanDay['meals']) => MealPlanDay['meals']) => {
    setState((prev) => {
      const updatedDays = prev.days.map((day) => {
        if (day.id !== dayId) return day
        return {
          ...day,
          meals: updateFn(day.meals),
        }
      })

      return {
        ...prev,
        days: updatedDays,
      }
    })
  }, [])

  return {
    ...state,
    refetch,
    updateDayMeals,
  }
}
