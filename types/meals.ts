// Cooking App Types

export type Meal = {
  id: string
  user_id: string
  name: string
  ingredients: string | null     // Optional
  instructions: string | null    // Optional
  video_url: string | null       // YouTube link, optional
  cuisine_type: string | null    // Italian, Mexican, Thai, etc.
  is_private: boolean            // Private (only you) or Public (everyone)
  created_at: string
}

export type DayMeal = Meal & {
  day_meal_id: string           // ID from meal_plan_day_meals junction table
  order_index: number           // Order within the day
}

export type MealPlanDay = {
  id: string
  user_id: string
  day_name: string              // "Monday", "Anniversary Dinner", etc.
  order_index: number           // Order of days in the plan
  is_active: boolean            // Active (shown) or Inactive (hidden)
  created_at: string
  meals: DayMeal[]              // Meals assigned to this day
}
