'use client'

import { useEffect, useRef } from 'react'
import { useSyncExternalStore } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { WorkoutPlanSummary, PlanExercise } from '@/types/plans'

type StoreState = {
  plans: WorkoutPlanSummary[] | null
  isLoading: boolean
  error: string | null
}

type Snapshot = StoreState

const store: StoreState = {
  plans: null,
  isLoading: true,
  error: null,
}

const subscribers = new Set<() => void>()
const notify = () => subscribers.forEach((cb) => cb())

let initialized = false
let fetchInitialized = false
let channel: ReturnType<ReturnType<typeof createClient>['channel']> | null = null
let pendingFetch: Promise<void> | null = null
let realtimeDebounceTimer: NodeJS.Timeout | null = null
let currentUserId: string | null = null
let authListenerInitialized = false

const formatPlans = (data: any[] | null): WorkoutPlanSummary[] => {
  if (!data) return []

  return data.map((plan: any) => {
    const { workout_plan_exercises = [], ...rest } = plan
    const rawExercises: PlanExercise[] = workout_plan_exercises.map((item: any) => ({
      ...item.exercises,
      plan_exercise_id: item.id,
      order_index: item.order_index,
      is_hidden: item.is_hidden,
    }))

    return {
      ...rest,
      exercises: rawExercises.filter((ex) => !ex.is_hidden),
      hiddenExercises: rawExercises.filter((ex) => ex.is_hidden),
    }
  })
}

const subscribeStore = (callback: () => void) => {
  subscribers.add(callback)
  return () => subscribers.delete(callback)
}

let lastSnapshot: Snapshot = {
  plans: store.plans,
  isLoading: store.isLoading,
  error: store.error,
}

const getSnapshot = (): Snapshot => {
  // Return a new snapshot object only when the store values actually change
  if (
    lastSnapshot.plans !== store.plans ||
    lastSnapshot.isLoading !== store.isLoading ||
    lastSnapshot.error !== store.error
  ) {
    lastSnapshot = {
      plans: store.plans,
      isLoading: store.isLoading,
      error: store.error,
    }
  }
  return lastSnapshot
}

const getServerSnapshot = (() => {
  const cached: Snapshot = {
    plans: null,
    isLoading: true,
    error: null,
  }
  return () => cached
})()

const clearStore = () => {
  store.plans = null
  store.isLoading = true
  store.error = null
  pendingFetch = null
  if (realtimeDebounceTimer) {
    clearTimeout(realtimeDebounceTimer)
    realtimeDebounceTimer = null
  }
  notify()
}

const fetchPlans = async (supabase: ReturnType<typeof createClient>) => {
  if (pendingFetch) {
    return pendingFetch
  }

  store.isLoading = true
  notify()

  pendingFetch = (async () => {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select(
          `
          *,
          workout_plan_exercises (
            id,
            order_index,
            is_hidden,
            exercises (*)
          )
        `
        )
        .order('created_at', { ascending: false })
        .order('order_index', { foreignTable: 'workout_plan_exercises', ascending: true })

      if (error) {
        store.error = error.message
      } else {
        store.error = null
        store.plans = formatPlans(data)
      }
    } catch (err: any) {
      store.error = err?.message || 'Failed to load plans'
    } finally {
      store.isLoading = false
      pendingFetch = null
      notify()
    }
  })()

  return pendingFetch
}

export function usePlansStore() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (!supabaseRef.current) {
    supabaseRef.current = createClient()
  }
  const supabase = supabaseRef.current!

  useEffect(() => {
    // Set up auth listener once globally to handle user changes
    if (!authListenerInitialized) {
      authListenerInitialized = true

      // Get initial user FIRST before setting up listener
      supabase.auth.getUser().then(({ data: { user } }) => {
        currentUserId = user?.id ?? null

        // Now set up the listener
        supabase.auth.onAuthStateChange(async (_event, session) => {
          const newUserId = session?.user?.id ?? null

          // If user changed (login, logout, or different user)
          if (newUserId !== currentUserId) {
            const previousUserId = currentUserId
            currentUserId = newUserId

            if (newUserId && previousUserId !== newUserId) {
              // User logged in or switched - clear old data and fetch new data
              clearStore()
              fetchInitialized = false // Reset fetch flag for new user
              await fetchPlans(supabase)
            } else if (!newUserId && previousUserId) {
              // User logged out - clear all data
              clearStore()
              fetchInitialized = false
            }
          }
        })
      })
    }

    // Only fetch once globally, not per component mount
    if (!fetchInitialized) {
      fetchInitialized = true
      fetchPlans(supabase)
    }

    if (!initialized) {
      initialized = true

      const debouncedFetch = () => {
        if (realtimeDebounceTimer) {
          clearTimeout(realtimeDebounceTimer)
        }
        realtimeDebounceTimer = setTimeout(() => {
          fetchPlans(supabase)
        }, 300) // Wait 300ms before refetching to allow optimistic update to settle
      }

      channel = supabase
        .channel('plans-updates')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'workout_plans' },
          debouncedFetch
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'workout_plan_exercises' },
          debouncedFetch
        )
        .subscribe()
    }

    return () => {
      // Keep subscription alive globally; no cleanup needed per component
    }
  }, [])

  const snapshot = useSyncExternalStore(subscribeStore, getSnapshot, getServerSnapshot)

  const optimisticHideExercise = (planId: string, planExerciseId: string): boolean => {
    if (!store.plans) return false

    let found = false
    store.plans = store.plans.map(plan => {
      if (plan.id !== planId) return plan

      // Find the exercise in the active list
      const exerciseToHide = plan.exercises.find(ex => ex.plan_exercise_id === planExerciseId)
      if (!exerciseToHide) return plan

      found = true
      // Mark it as hidden
      const updatedExercise = { ...exerciseToHide, is_hidden: true }

      return {
        ...plan,
        exercises: plan.exercises.filter(ex => ex.plan_exercise_id !== planExerciseId),
        hiddenExercises: [...plan.hiddenExercises, updatedExercise],
      }
    })

    if (found) {
      notify()
    }
    return found
  }

  const optimisticUnhideExercise = (planId: string, planExerciseId: string): boolean => {
    if (!store.plans) return false

    let found = false
    store.plans = store.plans.map(plan => {
      if (plan.id !== planId) return plan

      // Find the exercise in the hidden list
      const exerciseToUnhide = plan.hiddenExercises.find(ex => ex.plan_exercise_id === planExerciseId)
      if (!exerciseToUnhide) return plan

      found = true
      // Mark it as not hidden
      const updatedExercise = { ...exerciseToUnhide, is_hidden: false }

      // Add it back to exercises in the correct position based on order_index
      const newExercises = [...plan.exercises, updatedExercise].sort((a, b) => a.order_index - b.order_index)

      return {
        ...plan,
        exercises: newExercises,
        hiddenExercises: plan.hiddenExercises.filter(ex => ex.plan_exercise_id !== planExerciseId),
      }
    })

    if (found) {
      notify()
    }
    return found
  }

  const optimisticReorderExercises = (planId: string, oldIndex: number, newIndex: number): boolean => {
    if (!store.plans) return false

    let found = false
    store.plans = store.plans.map(plan => {
      if (plan.id !== planId) return plan

      if (oldIndex < 0 || oldIndex >= plan.exercises.length || newIndex < 0 || newIndex >= plan.exercises.length) {
        return plan
      }

      found = true
      // Reorder the exercises array
      const reorderedExercises = [...plan.exercises]
      const [movedExercise] = reorderedExercises.splice(oldIndex, 1)
      reorderedExercises.splice(newIndex, 0, movedExercise)

      // Update order_index for all exercises
      const updatedExercises = reorderedExercises.map((ex, idx) => ({
        ...ex,
        order_index: idx,
      }))

      return {
        ...plan,
        exercises: updatedExercises,
      }
    })

    if (found) {
      notify()
    }
    return found
  }

  return {
    plans: snapshot.plans ?? [],
    isLoading: snapshot.isLoading,
    error: snapshot.error,
    refresh: () => fetchPlans(supabase),
    optimisticHideExercise,
    optimisticUnhideExercise,
    optimisticReorderExercises,
  }
}
