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

export function useMealPlanStore(supabase: SupabaseClient) {
  const [state, setState] = useState<MealPlanState>({
    days: [],
    isLoading: true,
    error: null,
  })
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchMealPlanData = useCallback(async (): Promise<MealPlanDay[]> => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) throw sessionError

    const userId = session?.user?.id
    if (!userId) {
      return []
    }

    const { data: days, error: daysError } = await supabase
      .from('meal_plan_days')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true })

    if (daysError) throw daysError

    const dayIds = (days ?? []).map((day) => day.id)
    let dayMeals: DayMealRecord[] = []

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

    return (days || []).map((day) => {
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
  }, [supabase])

  const loadPlan = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    try {
      const daysWithMeals = await fetchMealPlanData()
      if (!isMountedRef.current) return

      setState({
        days: daysWithMeals,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error fetching meal plan:', error)
      if (!isMountedRef.current) return

      setState({
        days: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load meal plan',
      })
    }
  }, [fetchMealPlanData])

  useEffect(() => {
    loadPlan()
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadPlan()
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [loadPlan, supabase])

  const refetch = useCallback(() => {
    if (isMountedRef.current) {
      loadPlan()
    }
  }, [loadPlan])

  return {
    ...state,
    refetch,
  }
}
