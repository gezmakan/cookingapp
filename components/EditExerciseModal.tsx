'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type EditExerciseModalProps = {
  isOpen: boolean
  onClose: () => void
  exerciseId: string
  onSuccess: () => void
}

export default function EditExerciseModal({ isOpen, onClose, exerciseId, onSuccess }: EditExerciseModalProps) {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    name: '',
    sets: '',
    reps: '',
    video_url: '',
    muscle_groups: '',
    rest_minutes: '1',
    rest_seconds: '30',
    is_private: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUserExercise, setIsUserExercise] = useState(false)

  useEffect(() => {
    if (isOpen && exerciseId) {
      fetchExercise()
    }
  }, [isOpen, exerciseId])

  const fetchExercise = async () => {
    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single()

      if (error) throw error

      const belongsToUser = data.user_id === user.id
      setIsUserExercise(belongsToUser)

      setFormData({
        name: data.name,
        sets: data.sets.toString(),
        reps: data.reps,
        video_url: data.video_url || '',
        muscle_groups: data.muscle_groups || '',
        rest_minutes: data.rest_minutes.toString(),
        rest_seconds: data.rest_seconds.toString(),
        is_private: data.is_private || false,
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const updateData: any = {
        name: formData.name,
        sets: parseInt(formData.sets),
        reps: formData.reps,
        video_url: formData.video_url || null,
        muscle_groups: formData.muscle_groups || null,
        rest_minutes: parseInt(formData.rest_minutes),
        rest_seconds: parseInt(formData.rest_seconds),
      }

      if (isUserExercise) {
        updateData.is_private = formData.is_private
      }

      const { error } = await supabase
        .from('exercises')
        .update(updateData)
        .eq('id', exerciseId)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this exercise? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error: any) {
      setError(error.message)
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Exercise</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Exercise Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Push Ups"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sets">Sets *</Label>
                <Input
                  id="sets"
                  type="number"
                  min="1"
                  placeholder="e.g., 4"
                  value={formData.sets}
                  onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reps">Reps *</Label>
                <Input
                  id="reps"
                  placeholder="e.g., 8-12 or 10"
                  value={formData.reps}
                  onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="muscle_groups">Muscle Groups</Label>
              <Input
                id="muscle_groups"
                placeholder="e.g., chest, shoulder and triceps"
                value={formData.muscle_groups}
                onChange={(e) => setFormData({ ...formData, muscle_groups: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">Video URL (YouTube)</Label>
              <Input
                id="video_url"
                type="url"
                placeholder="e.g., https://www.youtube.com/watch?v=..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rest_minutes">Rest Minutes</Label>
                <Input
                  id="rest_minutes"
                  type="number"
                  min="0"
                  value={formData.rest_minutes}
                  onChange={(e) => setFormData({ ...formData, rest_minutes: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rest_seconds">Rest Seconds</Label>
                <Input
                  id="rest_seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={formData.rest_seconds}
                  onChange={(e) => setFormData({ ...formData, rest_seconds: e.target.value })}
                />
              </div>
            </div>

            {isUserExercise && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_private"
                  checked={formData.is_private}
                  onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="is_private" className="cursor-pointer">
                  Make this exercise private (only visible to you)
                </Label>
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center pt-4">
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
              </div>
              {isUserExercise && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
