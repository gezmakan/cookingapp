export type Exercise = {
  id: string
  name: string
  sets: number
  reps: string
  video_url: string | null
  muscle_groups: string | null
  rest_minutes: number
  rest_seconds: number
}

export type PlanExercise = Exercise & {
  plan_exercise_id: string
  order_index: number
  is_hidden: boolean
}

export type WorkoutPlanSummary = {
  id: string
  user_id: string
  name: string
  created_at: string
  exercises: PlanExercise[]
  hiddenExercises: PlanExercise[]
}
