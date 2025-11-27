'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

export type IngredientStatusMap = Record<string, boolean>

export const normalizeIngredient = (value: string) => value.trim().toLowerCase()

export function useIngredientStatus(supabase: SupabaseClient) {
  const [statusMap, setStatusMap] = useState<IngredientStatusMap>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatuses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatusMap({})
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_ingredient_status')
        .select('ingredient, has_item')
        .eq('user_id', user.id)

      if (error) throw error

      const map: IngredientStatusMap = {}
      data?.forEach((row) => {
        if (row.ingredient) {
          map[row.ingredient] = row.has_item ?? false
        }
      })
      setStatusMap(map)
    } catch (err) {
      console.error('Error loading ingredient status:', err)
      setError(err instanceof Error ? err.message : 'Failed to load ingredient status')
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  const setIngredientStatus = useCallback(
    async (ingredient: string, hasItem: boolean) => {
      const normalized = normalizeIngredient(ingredient)
      if (!normalized) return

      // Optimistic update
      const previousValue = statusMap[normalized]
      setStatusMap((prev) => ({
        ...prev,
        [normalized]: hasItem,
      }))

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Not authenticated')

        const { error } = await supabase
          .from('user_ingredient_status')
          .upsert(
            {
              user_id: user.id,
              ingredient: normalized,
              has_item: hasItem,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id, ingredient' }
          )

        if (error) throw error
      } catch (err) {
        // Revert on error
        setStatusMap((prev) => ({
          ...prev,
          [normalized]: previousValue ?? false,
        }))
        console.error('Error updating ingredient status:', err)
        setError(err instanceof Error ? err.message : 'Failed to update ingredient status')
        throw err
      }
    },
    [supabase, statusMap]
  )

  const resetStatuses = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_ingredient_status')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      setStatusMap({})
    } catch (err) {
      console.error('Error resetting ingredient status:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset ingredient status')
      throw err
    }
  }, [supabase])

  useEffect(() => {
    fetchStatuses()
  }, [fetchStatuses])

  return {
    statusMap,
    isLoading,
    error,
    refresh: fetchStatuses,
    setIngredientStatus,
    resetStatuses,
  }
}
