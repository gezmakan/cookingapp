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
  planId: string | null
  planName: string | null
  planSubtitle: string | null
  canEdit: boolean
  isAuthenticated: boolean
}

export function useMealPlanStore(supabase: SupabaseClient, requestedPlanId?: string | null) {
  const [state, setState] = useState<MealPlanState>({
    days: [],
    isLoading: true,
    error: null,
    planId: null,
    planName: null,
    planSubtitle: null,
    canEdit: false,
    isAuthenticated: false,
  })

  const isMountedRef = useRef(false)
  const initialLoadRef = useRef(true)
  const fetchPlan = useCallback(async (showLoading: boolean) => {
    if (showLoading) {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))
    } else {
      setState((prev) => ({ ...prev, error: null }))
    }

    let derivedAuthState = false

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      const userId = session?.user?.id
      const userEmail = session?.user?.email
      derivedAuthState = !!userId

      let planId = requestedPlanId
      let canEdit = false
      let planName = ''
      let planSubtitle: string | null = null

      if (derivedAuthState) {
        // If no specific plan requested, load the default plan
        if (!planId) {
          const { data: prefs } = await supabase
            .from('user_preferences')
            .select('default_plan_id')
            .eq('user_id', userId)
            .single()

          planId = prefs?.default_plan_id || null

          // If no default plan set, get the user's first plan
          if (!planId) {
            const { data: plans } = await supabase
              .from('meal_plans')
              .select('id')
              .eq('user_id', userId)
              .order('created_at', { ascending: true })
              .limit(1)

            planId = plans?.[0]?.id || null
          }
        }
      } else if (!planId) {
        const { data: settings, error: settingsError } = await supabase
          .from('app_settings')
          .select('public_plan_id')
          .eq('id', 1)
          .single()

        if (settingsError) throw settingsError
        planId = settings?.public_plan_id || null
      }

      if (!planId) {
        if (isMountedRef.current) {
          setState({
            days: [],
            isLoading: false,
            error: 'No meal plan found',
            planId: null,
            planName: null,
            planSubtitle: null,
            canEdit: false,
            isAuthenticated: derivedAuthState,
          })
        }
        initialLoadRef.current = false
        return
      }

      // Load the plan details
      const { data: plan, error: planError } = await supabase
        .from('meal_plans')
        .select('id, name, subtitle, user_id, is_public')
        .eq('id', planId)
        .single()

      if (planError) throw planError
      if (!plan) {
        throw new Error('Plan not found')
      }

      planName = plan.name
      planSubtitle = plan.subtitle || null

      if (!derivedAuthState && !plan.is_public) {
        throw new Error('Plan is not public')
      }

      // Determine if user can edit
      if (derivedAuthState) {
        if (plan.user_id === userId) {
          canEdit = true
        } else if (userEmail) {
          // Check if plan is shared with edit permission
          const { data: share } = await supabase
            .from('plan_shares')
            .select('permission')
            .eq('plan_id', planId)
            .eq('shared_with_email', userEmail)
            .single()

          canEdit = share?.permission === 'edit'
        }
      }

      // Load days for this plan
      const { data: days, error: daysError } = await supabase
        .from('meal_plan_days')
        .select('*')
        .eq('plan_id', planId)
        .order('order_index', { ascending: true })

      if (daysError) throw daysError

      const dayIds = (days ?? []).map((day) => day.id)
      let dayMeals: DayMealRecord[] = []

      // Note: We don't seed days here anymore - they're created by the trigger

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
        setState({
          days: daysWithMeals,
          isLoading: false,
          error: null,
          planId: planId,
          planName: planName,
          planSubtitle,
          canEdit: canEdit,
          isAuthenticated: derivedAuthState,
        })
      }
    } catch (error) {
      console.error('Error fetching meal plan:', error)
      if (isMountedRef.current) {
        setState({
          days: [],
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load meal plan',
          planId: null,
          planName: null,
          planSubtitle: null,
          canEdit: false,
          isAuthenticated: derivedAuthState,
        })
      }
    } finally {
      initialLoadRef.current = false
    }
  }, [supabase, requestedPlanId])

  useEffect(() => {
    isMountedRef.current = true
    fetchPlan(true)

    return () => {
      isMountedRef.current = false
    }
  }, [fetchPlan])

  const refetch = useCallback(async () => {
    await fetchPlan(initialLoadRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
