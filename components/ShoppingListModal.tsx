'use client'

import { useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { MealPlanDay } from '@/types/meals'
import type { IngredientStatusMap } from '@/hooks/useIngredientStatus'
import { normalizeIngredient } from '@/hooks/useIngredientStatus'

type ShoppingListModalProps = {
  isOpen: boolean
  onClose: () => void
  days: MealPlanDay[]
  statusMap: IngredientStatusMap
  onToggleIngredient: (ingredient: string, hasItem: boolean) => Promise<void>
  onReset: () => Promise<void>
}

type IngredientEntry = {
  key: string
  label: string
  sources: string[]
}

const splitIngredients = (text?: string | null) => {
  if (!text) return []
  return text
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

export default function ShoppingListModal({
  isOpen,
  onClose,
  days,
  statusMap,
  onToggleIngredient,
  onReset,
}: ShoppingListModalProps) {
  const [showResetDialog, setShowResetDialog] = useState(false)

  const ingredients = useMemo<IngredientEntry[]>(() => {
    const map = new Map<string, IngredientEntry>()

    days.forEach((day) => {
      day.meals.forEach((meal) => {
        splitIngredients(meal.ingredients).forEach((ingredient) => {
          const key = normalizeIngredient(ingredient)
          if (!key) return
          const entry = map.get(key)
          if (entry) {
            entry.sources.push(`${day.day_name} — ${meal.name}`)
          } else {
            map.set(key, {
              key,
              label: ingredient,
              sources: [`${day.day_name} — ${meal.name}`],
            })
          }
        })
      })
    })

    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [days])

  const handleResetConfirm = async () => {
    await onReset()
    setShowResetDialog(false)
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-[calc(100vw-2rem)] sm:max-w-3xl md:max-w-4xl p-0 overflow-hidden sm:rounded-3xl">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-20"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col max-h-[90vh]">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-4 sm:px-6 py-4 border-b">
              <DialogHeader>
                <DialogTitle>Shopping List</DialogTitle>
              </DialogHeader>

              <div className="flex justify-center mt-3">
                <Button variant="ghost" size="sm" onClick={() => setShowResetDialog(true)} disabled={!ingredients.length}>
                  Reset list
                </Button>
              </div>
            </div>

          <div className="flex-1 overflow-y-auto shopping-list-scroll px-4 sm:px-6 py-4 space-y-4">
            {ingredients.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                Add meals to your plan to generate a shopping list.
              </div>
            ) : (
              <div className="space-y-3">
                {ingredients.map((ingredient) => {
                  const checked = statusMap[ingredient.key] ?? false
                  return (
                    <label
                      key={ingredient.key}
                      className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 hover:border-orange-300 transition-colors"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(val) => onToggleIngredient(ingredient.label, Boolean(val))}
                        className="shrink-0"
                      />
                      <div className="flex-1 min-w-0 break-words">
                        <p className={`font-medium break-words ${checked ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {ingredient.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 break-words">
                          {ingredient.sources.join(' • ')}
                        </p>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset shopping list?</AlertDialogTitle>
          <AlertDialogDescription>
            This will clear all checkmarks from your shopping list. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleResetConfirm}>Reset</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
