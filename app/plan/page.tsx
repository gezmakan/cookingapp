'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMealPlanStore } from '@/hooks/useMealPlanStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Loader2, Edit2, Trash2, Video, Search, GripVertical, Sparkles, UtensilsCrossed, Crown } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Meal } from '@/types/meals'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import VideoModal from '@/components/VideoModal'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DayMeal } from '@/types/meals'

// Sortable Meal Row Component
function SortableMealRow({
  meal,
  isEditMode,
  onVideoClick,
  onDelete,
}: {
  meal: DayMeal
  isEditMode: boolean
  onVideoClick: () => void
  onDelete: () => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: meal.day_meal_id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-orange-200 transition-colors"
    >
      {isEditMode && (
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <div
        className={`flex-1 ${meal.video_url ? 'cursor-pointer' : ''}`}
        onClick={() => {
          if (meal.video_url) {
            onVideoClick()
          }
        }}
      >
        <div className="flex items-center gap-2">
          <h4 className={`font-medium text-gray-900 ${meal.video_url ? 'hover:text-orange-600 transition-colors' : ''}`}>
            {meal.name}
          </h4>
          {meal.video_url && (
            <Video className="h-3.5 w-3.5 text-orange-600" />
          )}
        </div>
        {meal.cuisine_type && (
          <span className="text-xs text-gray-500">{meal.cuisine_type}</span>
        )}
      </div>
      {isEditMode && (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}

export default function MealPlanPage() {
  const supabase = createClient()
  const { days, isLoading, error, refetch, updateDayMeals } = useMealPlanStore(supabase)

  const [isEditMode, setIsEditMode] = useState(false)
  const [isAddDayOpen, setIsAddDayOpen] = useState(false)
  const [dayName, setDayName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Meal selection state
  const [isSelectMealOpen, setIsSelectMealOpen] = useState(false)
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [availableMeals, setAvailableMeals] = useState<Meal[]>([])
  const [mealSearch, setMealSearch] = useState('')
  const [isLoadingMeals, setIsLoadingMeals] = useState(false)

  // Video modal state
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string; meal?: Meal } | null>(null)

  // Day name editing state
  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [editingDayName, setEditingDayName] = useState('')

  // Menu title/subtitle state
  const [menuTitle, setMenuTitle] = useState('Menu')
  const [menuSubtitle, setMenuSubtitle] = useState('Plan your weekly meals')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitleValue, setEditTitleValue] = useState('')
  const [editSubtitleValue, setEditSubtitleValue] = useState('')
  const activeDays = (days || []).filter((day) => day.is_active)
  const inactiveDays = (days || []).filter((day) => !day.is_active)
  const totalMeals = activeDays.reduce((sum, day) => sum + day.meals.length, 0)
  const cuisines = activeDays
    .flatMap((day) => day.meals.map((meal) => meal.cuisine_type).filter(Boolean) as string[])
  const cuisineCounts = cuisines.reduce<Record<string, number>>((acc, cuisine) => {
    acc[cuisine] = (acc[cuisine] || 0) + 1
    return acc
  }, {})
  const signatureCuisine = Object.entries(cuisineCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  const nextFeaturedMeal = activeDays.find((day) => day.meals.length > 0)?.meals[0] || null
  const hasPlanContent = activeDays.length > 0
  const heroSubtitle = menuSubtitle || 'Plan your weekly meals'
  const weekdayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentWeekdayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()).toLowerCase()
  const selectedDay = selectedDayId ? days?.find((day) => day.id === selectedDayId) : null
  const handleExportPlan = () => window.print()

  const handleSaveTitleSubtitle = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          menu_title: editTitleValue.trim() || 'Menu',
          menu_subtitle: editSubtitleValue.trim(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (error) {
        console.error('Upsert error:', error)
        throw error
      }

      setMenuTitle(editTitleValue.trim() || 'Menu')
      setMenuSubtitle(editSubtitleValue.trim())
      setIsEditingTitle(false)
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Failed to save')
    }
  }

  const titleEditor = (
    <div className="flex-1 max-w-md space-y-2">
      <Input
        value={editTitleValue}
        onChange={(e) => setEditTitleValue(e.target.value)}
        placeholder="Menu title"
        className="text-2xl font-bold h-12"
        maxLength={50}
      />
      <Input
        value={editSubtitleValue}
        onChange={(e) => setEditSubtitleValue(e.target.value)}
        placeholder="Subtitle (optional)"
        maxLength={100}
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSaveTitleSubtitle}>Save</Button>
        <Button size="sm" variant="outline" onClick={() => setIsEditingTitle(false)}>Cancel</Button>
      </div>
    </div>
  )

  // Drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('user_preferences')
          .select('menu_title, menu_subtitle')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        if (data) {
          setMenuTitle(data.menu_title || 'Menu')
          setMenuSubtitle(data.menu_subtitle || 'Plan your weekly meals')
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
      }
    }

    loadPreferences()
  }, [])

  const handleStartEditingTitle = () => {
    setEditTitleValue(menuTitle)
    setEditSubtitleValue(menuSubtitle)
    setIsEditingTitle(true)
  }

  const handleAddDay = async () => {
    if (!dayName.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const maxOrder = days?.length ? Math.max(...days.map(d => d.order_index)) : -1

      const { error } = await supabase
        .from('meal_plan_days')
        .insert({
          user_id: user.id,
          day_name: dayName.trim(),
          order_index: maxOrder + 1,
        })

      if (error) throw error

      setDayName('')
      setIsAddDayOpen(false)
      await refetch()
    } catch (error) {
      console.error('Error adding day:', error)
      alert('Failed to add day')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteDay = async (dayId: string) => {
    if (!confirm('Are you sure you want to delete this day and all its meals?')) return

    try {
      const { error } = await supabase
        .from('meal_plan_days')
        .delete()
        .eq('id', dayId)

      if (error) throw error

      await refetch()
    } catch (error) {
      console.error('Error deleting day:', error)
      alert('Failed to delete day')
    }
  }

  const handleToggleActive = async (dayId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('meal_plan_days')
        .update({ is_active: !currentActive })
        .eq('id', dayId)

      if (error) throw error

      await refetch()
    } catch (error) {
      console.error('Error toggling day active state:', error)
      alert('Failed to toggle day')
    }
  }

  const handleStartEditingDayName = (dayId: string, currentName: string) => {
    setEditingDayId(dayId)
    setEditingDayName(currentName)
  }

  const handleCommitDayName = async (dayId: string) => {
    const trimmed = editingDayName.trim()
    if (!trimmed) {
      alert('Day name cannot be empty')
      return
    }

    try {
      const { error } = await supabase
        .from('meal_plan_days')
        .update({ day_name: trimmed })
        .eq('id', dayId)

      if (error) throw error

      await refetch()
      setEditingDayId(null)
      setEditingDayName('')
    } catch (error) {
      console.error('Error updating day name:', error)
      alert('Failed to update day name')
    }
  }

  const handleCancelDayNameEdit = () => {
    setEditingDayId(null)
    setEditingDayName('')
  }

  const handleDragEnd = async (dayId: string, event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const day = days?.find(d => d.id === dayId)
    if (!day) return

    const oldIndex = day.meals.findIndex(m => m.day_meal_id === active.id)
    const newIndex = day.meals.findIndex(m => m.day_meal_id === over.id)

    const newMeals = arrayMove(day.meals, oldIndex, newIndex)
    const previousMeals = day.meals

    updateDayMeals(dayId, () => newMeals)

    try {
      const updates = newMeals.map((meal, idx) => ({
        id: meal.day_meal_id,
        order_index: idx,
      }))

      for (const update of updates) {
        await supabase
          .from('meal_plan_day_meals')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
      }

      refetch()
    } catch (error) {
      updateDayMeals(dayId, () => previousMeals)
      console.error('Error reordering meals:', error)
      alert('Failed to reorder meals')
    }
  }

  const openMealSelector = async (dayId: string) => {
    setSelectedDayId(dayId)
    setEditingDayId(dayId)
    const day = days?.find((d) => d.id === dayId)
    setEditingDayName(day?.day_name || '')
    setIsSelectMealOpen(true)
    setMealSearch('')

    // Fetch available meals
    setIsLoadingMeals(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error
      setAvailableMeals(data || [])
    } catch (error) {
      console.error('Error loading meals:', error)
      alert('Failed to load meals')
    } finally {
      setIsLoadingMeals(false)
    }
  }

  const handleAddMealToDay = async (mealId: string) => {
    if (!selectedDayId) return

    setIsSubmitting(true)
    try {
      const day = days?.find(d => d.id === selectedDayId)
      if (!day) throw new Error('Day not found')

      const maxOrder = day.meals.length ? Math.max(...day.meals.map(m => m.order_index)) : -1

      const { error } = await supabase
        .from('meal_plan_day_meals')
        .insert({
          meal_plan_day_id: selectedDayId,
          meal_id: mealId,
          order_index: maxOrder + 1,
        })

      if (error) throw error

      setIsSelectMealOpen(false)
      setSelectedDayId(null)
      await refetch()
    } catch (error) {
      console.error('Error adding meal to day:', error)
      alert('Failed to add meal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveMealFromDay = async (dayMealId: string) => {
    try {
      const { error } = await supabase
        .from('meal_plan_day_meals')
        .delete()
        .eq('id', dayMealId)

      if (error) throw error

      await refetch()
    } catch (error) {
      console.error('Error removing meal:', error)
      alert('Failed to remove meal')
    }
  }

  const filteredMeals = availableMeals.filter(meal =>
    meal.name.toLowerCase().includes(mealSearch.toLowerCase()) ||
    meal.cuisine_type?.toLowerCase().includes(mealSearch.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading your meal plan...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col print:bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl flex-1 space-y-6 print-area">
        {isEditMode ? (
          <>
            <div className="flex items-center justify-between mb-8">
              {isEditingTitle ? (
                titleEditor
              ) : (
                <div className="group cursor-pointer" onClick={handleStartEditingTitle}>
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-gray-900">{menuTitle}</h1>
                    <Edit2 className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  {menuSubtitle && <p className="text-gray-600 mt-1">{menuSubtitle}</p>}
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button
                  variant={isEditMode ? "default" : "outline"}
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={isEditMode ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {isEditMode ? 'Done' : 'Edit'}
                </Button>
                {isEditMode && (
                  <Button onClick={() => setIsAddDayOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Day
                  </Button>
                )}
              </div>
            </div>

            {!days || days.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 mb-4">No days in your meal plan yet.</p>
                  <Button onClick={() => setIsAddDayOpen(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Day
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {days.filter(day => day.is_active).map((day) => (
                  <Card key={day.id} className="border-orange-100">
                    <CardHeader className="!px-4 !pt-3.5 !pb-3 border-b border-orange-50">
                      <div className="flex items-center justify-between">
                        {editingDayId === day.id ? (
                          <Input
                            value={editingDayName}
                            onChange={(e) => setEditingDayName(e.target.value)}
                            onBlur={() => handleCommitDayName(day.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleCommitDayName(day.id)
                              }
                              if (e.key === 'Escape') {
                                handleCancelDayNameEdit()
                              }
                            }}
                            className="text-xl font-semibold h-9 max-w-xs"
                            autoFocus
                          />
                        ) : (
                          <CardTitle
                            className={`text-xl ${isEditMode ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
                            onClick={() => isEditMode && handleStartEditingDayName(day.id, day.day_name)}
                            title={isEditMode ? 'Click to edit' : ''}
                          >
                            {day.day_name}
                          </CardTitle>
                        )}
                        {isEditMode && (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Active</span>
                              <button
                                type="button"
                                onClick={() => handleToggleActive(day.id, day.is_active)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                                  day.is_active ? 'bg-green-600' : 'bg-gray-300'
                                }`}
                                title={day.is_active ? "Active (shown)" : "Inactive (hidden)"}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    day.is_active ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDay(day.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      {day.meals.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-gray-400 mb-3">No meals yet</p>
                          {isEditMode && (
                            <Button variant="outline" size="sm" onClick={() => openMealSelector(day.id)}>
                              <Plus className="h-3 w-3 mr-1" />
                              Add Meal
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => handleDragEnd(day.id, event)}
                          >
                            <SortableContext
                              items={day.meals.map(m => m.day_meal_id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {day.meals.map((meal) => (
                                <SortableMealRow
                                  key={meal.day_meal_id}
                                  meal={meal}
                                  isEditMode={isEditMode}
                                  onVideoClick={() => setSelectedVideo({ url: meal.video_url!, title: meal.name, meal })}
                                  onDelete={() => handleRemoveMealFromDay(meal.day_meal_id)}
                                />
                              ))}
                            </SortableContext>
                          </DndContext>
                          {isEditMode && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => openMealSelector(day.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add Another Meal
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                </div>

                {isEditMode && days.filter(day => !day.is_active).length > 0 && (
                  <div className="mt-12">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Inactive Days</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {days.filter(day => !day.is_active).map((day) => (
                        <Card key={day.id} className="border-gray-300 bg-gray-50">
                          <CardHeader className="!px-4 !pt-3.5 !pb-3 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              {editingDayId === day.id ? (
                                <Input
                                  value={editingDayName}
                                  onChange={(e) => setEditingDayName(e.target.value)}
                                  onBlur={() => handleCommitDayName(day.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleCommitDayName(day.id)
                                    }
                                    if (e.key === 'Escape') {
                                      handleCancelDayNameEdit()
                                    }
                                  }}
                                  className="text-xl font-semibold h-9 max-w-xs"
                                  autoFocus
                                />
                              ) : (
                                <CardTitle
                                  className="text-xl text-gray-600 cursor-pointer hover:opacity-70 transition-opacity"
                                  onClick={() => handleStartEditingDayName(day.id, day.day_name)}
                                  title="Click to edit"
                                >
                                  {day.day_name}
                                </CardTitle>
                              )}
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Active</span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleActive(day.id, day.is_active)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                                      day.is_active ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                                    title={day.is_active ? "Active (shown)" : "Inactive (hidden)"}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        day.is_active ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteDay(day.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4">
                            {day.meals.length === 0 ? (
                              <div className="py-8 text-center">
                                <p className="text-gray-400 mb-3">No meals yet</p>
                                <Button variant="outline" size="sm" onClick={() => openMealSelector(day.id)}>
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Meal
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3 opacity-60">
                                <DndContext
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={(event) => handleDragEnd(day.id, event)}
                                >
                                  <SortableContext
                                    items={day.meals.map(m => m.day_meal_id)}
                                    strategy={verticalListSortingStrategy}
                                  >
                                    {day.meals.map((meal) => (
                                      <SortableMealRow
                                        key={meal.day_meal_id}
                                        meal={meal}
                                        isEditMode={true}
                                        onVideoClick={() => setSelectedVideo({ url: meal.video_url!, title: meal.name, meal })}
                                        onDelete={() => handleRemoveMealFromDay(meal.day_meal_id)}
                                      />
                                    ))}
                                  </SortableContext>
                                </DndContext>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full mt-2"
                                  onClick={() => openMealSelector(day.id)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Another Meal
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {isEditingTitle ? (
              <div className="mb-10">
                {titleEditor}
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl bg-[#1c120a] text-white px-5 py-5 md:px-9 md:py-8 mb-10 shadow-[0px_30px_80px_rgba(0,0,0,0.25)] print:bg-white print:text-black print:shadow-none print:mb-6">
                <div className="absolute inset-0 print-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-900/80 via-orange-700/70 to-rose-500/70" />
                  <div className="absolute -right-10 top-0 w-72 h-72 bg-orange-200/40 blur-3xl" />
                  <div className="absolute -left-10 bottom-0 w-72 h-72 bg-rose-200/30 blur-3xl" />
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)' }} />
                </div>
                <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                  <div className="flex items-center gap-3 mt-1">
                    <h1 className="text-4xl md:text-5xl font-semibold">{menuTitle}</h1>
                    <Sparkles className="h-6 w-6 text-orange-200" />
                  </div>
                  {heroSubtitle && <p className="text-lg text-orange-50/80 mt-2 max-w-2xl">{heroSubtitle}</p>}
                  </div>
                </div>
              </div>
            )}
            {hasPlanContent ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {activeDays.map((day) => {
                    const normalizedDayName = day.day_name.trim().toLowerCase()
                    const isWeekdayName = weekdayNames.includes(normalizedDayName)
                    const isToday = isWeekdayName && normalizedDayName === currentWeekdayName

                    return (
                      <div
                        key={day.id}
                        className={`group relative overflow-hidden rounded-3xl shadow-[0px_25px_70px_rgba(0,0,0,0.08)] border transition-all ${
                          isToday
                            ? 'bg-white border-transparent ring-2 ring-orange-200 shadow-[0px_25px_80px_rgba(253,186,116,0.35)]'
                            : 'bg-white border-white/70'
                        }`}
                      >
                        <div className="relative p-6 space-y-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-2xl font-semibold text-gray-900">{day.day_name}</h3>
                            </div>
                            {isToday && (
                              <span className="rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-xs font-semibold">
                                Today
                              </span>
                            )}
                          </div>
                          <div className="space-y-3">
                          {day.meals.length === 0 ? (
                            <button
                              type="button"
                              className="w-full rounded-2xl border border-dashed border-gray-200 p-6 text-center text-orange-500 hover:border-orange-300 hover:text-orange-600 transition-all"
                              onClick={() => {
                                setIsEditMode(true)
                                setEditingDayId(day.id)
                                setEditingDayName(day.day_name)
                                openMealSelector(day.id)
                              }}
                            >
                              Add meals
                            </button>
                          ) : (
                            day.meals.map((meal) => (
                              <div
                                key={meal.day_meal_id}
                                  className={`rounded-2xl border border-transparent bg-gray-50/90 px-4 py-3 transition-all ${
                                    meal.video_url ? 'cursor-pointer hover:border-orange-200 hover:bg-white' : ''
                                  }`}
                                  onClick={() => {
                                    if (meal.video_url) {
                                      setSelectedVideo({ url: meal.video_url!, title: meal.name, meal })
                                    }
                                  }}
                                >
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="min-w-0">
                                      <p className="font-medium text-gray-900 truncate">{meal.name}</p>
                                      {meal.cuisine_type && (
                                        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mt-1">
                                          {meal.cuisine_type}
                                        </p>
                                      )}
                                    </div>
                                    {!meal.video_url && (
                                      <span className="text-xs text-gray-400">No video</span>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-center mt-12 print:hidden">
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg hover:from-orange-600 hover:to-rose-600 border-0"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Plan
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-orange-200 bg-white/80 p-10 text-center shadow-[0px_20px_60px_rgba(0,0,0,0.05)]">
                <p className="text-sm uppercase tracking-[0.4em] text-orange-400">No tastings yet</p>
                <h3 className="text-3xl font-semibold text-gray-900 mt-4">Compose your first menu</h3>
                <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
                  Begin by adding a day, then pair it with signature dishes to craft a Michelin-caliber experience.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                  <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() => {
                      setIsEditMode(true)
                      setIsAddDayOpen(true)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Plan a day
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Day Dialog */}
      <Dialog open={isAddDayOpen} onOpenChange={setIsAddDayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Day to Meal Plan</DialogTitle>
            <DialogDescription>
              Give your day a name (e.g., "Monday", "Anniversary Dinner", "Weekend Brunch")
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="day-name">Day Name</Label>
            <Input
              id="day-name"
              value={dayName}
              onChange={(e) => setDayName(e.target.value)}
              placeholder="e.g., Monday, Saturday, Date Night..."
              className="mt-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isSubmitting) {
                  handleAddDay()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDayOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleAddDay} disabled={!dayName.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Day'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Select Meal Dialog */}
      <Dialog open={isSelectMealOpen} onOpenChange={setIsSelectMealOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Add Meal to {selectedDay?.day_name || menuTitle}</DialogTitle>
            <DialogDescription>
              Choose a meal from your library to add to {selectedDay?.day_name || 'this plan'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search meals..."
                value={mealSearch}
                onChange={(e) => setMealSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Meals List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {isLoadingMeals ? (
                <div className="py-12 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-orange-600" />
                  <p className="text-gray-500 text-sm">Loading meals...</p>
                </div>
              ) : filteredMeals.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-gray-500 mb-2">
                    {mealSearch ? 'No meals found matching your search' : 'No meals in your library yet'}
                  </p>
                  {!mealSearch && (
                    <Button variant="link" onClick={() => {
                      setIsSelectMealOpen(false)
                      window.location.href = '/meals/add'
                    }}>
                      Add your first meal
                    </Button>
                  )}
                </div>
              ) : (
                filteredMeals.map((meal) => {
                  const thumbnail = meal.video_url
                    ? meal.video_url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
                    : null

                  return (
                    <button
                      key={meal.id}
                      onClick={() => handleAddMealToDay(meal.id)}
                      disabled={isSubmitting}
                      className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* Thumbnail */}
                      <div className="w-20 h-14 rounded bg-gradient-to-br from-orange-100 to-orange-200 flex-shrink-0 overflow-hidden">
                        {thumbnail ? (
                          <img
                            src={`https://img.youtube.com/vi/${thumbnail}/mqdefault.jpg`}
                            alt={meal.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl opacity-50">
                            🍽️
                          </div>
                        )}
                      </div>

                      {/* Meal Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 truncate">{meal.name}</h4>
                          {meal.video_url && (
                            <Video className="h-3.5 w-3.5 text-orange-600 flex-shrink-0" />
                          )}
                        </div>
                        {meal.cuisine_type && (
                          <span className="inline-block mt-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">
                            {meal.cuisine_type}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSelectMealOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
          meal={selectedVideo.meal}
        />
      )}

      <Footer />
    </div>
  )
}
