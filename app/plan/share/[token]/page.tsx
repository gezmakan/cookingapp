'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Calendar, ArrowLeft } from 'lucide-react'
import VideoModal from '@/components/VideoModal'

type Meal = {
  id: string
  user_id: string
  name: string
  ingredients: string | null
  instructions: string | null
  video_url: string | null
  cuisine_type: string | null
  is_private: boolean
  created_at: string
}

type DayMeal = {
  day_meal_id: string
  id: string
  order_index: number
  user_id: string
  name: string
  ingredients: string | null
  instructions: string | null
  video_url: string | null
  cuisine_type: string | null
  is_private: boolean
  created_at: string
}

type Day = {
  id: string
  day_name: string
  day_order: number
  meals: DayMeal[]
}

type MealPlan = {
  id: string
  name: string
  subtitle: string | null
  days: Day[]
}

export default function PublicPlanPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<MealPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)

  useEffect(() => {
    loadPublicPlan()
  }, [token])

  const loadPublicPlan = async () => {
    try {
      // Find the plan by share token
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('id, name, subtitle, is_public, share_token')
        .eq('share_token', token)
        .eq('is_public', true)
        .single()

      if (planError || !planData) {
        setError('This plan does not exist or is no longer public')
        setLoading(false)
        return
      }

      // Load the plan's days and meals
      const { data: daysData, error: daysError } = await supabase
        .from('meal_plan_days')
        .select('*')
        .eq('plan_id', planData.id)
        .eq('is_active', true)
        .order('order_index', { ascending: true })

      if (daysError) throw daysError

      const days: Day[] = []

      for (const day of daysData || []) {
        const { data: dayMealsData, error: dayMealsError } = await supabase
          .from('meal_plan_day_meals')
          .select(`
            id,
            order_index,
            meals (
              id,
              user_id,
              name,
              ingredients,
              instructions,
              video_url,
              cuisine_type,
              is_private,
              created_at
            )
          `)
          .eq('meal_plan_day_id', day.id)
          .order('order_index', { ascending: true })

        if (dayMealsError) throw dayMealsError

        const meals: DayMeal[] = (dayMealsData || []).map((dm: any) => ({
          day_meal_id: dm.id,
          id: dm.meals.id,
          order_index: dm.order_index,
          user_id: dm.meals.user_id,
          name: dm.meals.name,
          ingredients: dm.meals.ingredients,
          instructions: dm.meals.instructions,
          video_url: dm.meals.video_url,
          cuisine_type: dm.meals.cuisine_type,
          is_private: dm.meals.is_private,
          created_at: dm.meals.created_at,
        }))

        days.push({
          id: day.id,
          day_name: day.day_name,
          day_order: day.order_index,
          meals,
        })
      }

      setPlan({
        id: planData.id,
        name: planData.name,
        subtitle: planData.subtitle,
        days,
      })
    } catch (err) {
      console.error('Error loading public plan:', err)
      setError('Failed to load meal plan')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading meal plan...</p>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Plan Not Found</h1>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push('/')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 font-quicksand">{plan.name}</h1>
          <p className="text-lg text-gray-600">{plan.subtitle || 'Plan your weekly meals'}</p>
          <p className="text-sm text-gray-500 mt-1">Public meal plan</p>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plan.days.map((day) => (
            <div
              key={day.id}
              className="bg-white rounded-3xl border border-orange-100 shadow-sm p-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3 font-quicksand">
                {day.day_name}
              </h3>

              {day.meals.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No meals planned</p>
              ) : (
                <div className="space-y-2">
                  {day.meals.map((meal) => (
                    <div
                      key={meal.day_meal_id}
                      className="bg-gradient-to-r from-orange-50/50 to-rose-50/50 rounded-2xl p-3 border border-orange-100 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => {
                        if (meal.video_url) {
                          setSelectedMeal(meal)
                          setVideoModalOpen(true)
                        }
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm line-clamp-2">
                            {meal.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Video Modal */}
        {selectedMeal && selectedMeal.video_url && (
          <VideoModal
            isOpen={videoModalOpen}
            onClose={() => {
              setVideoModalOpen(false)
              setSelectedMeal(null)
            }}
            videoUrl={selectedMeal.video_url}
            title={selectedMeal.name}
            meal={selectedMeal}
          />
        )}
      </div>
    </div>
  )
}
