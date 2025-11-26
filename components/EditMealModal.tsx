'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Globe, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type EditMealModalProps = {
  isOpen: boolean
  onClose: () => void
  mealId: string
  onSuccess: () => void
}

export default function EditMealModal({ isOpen, onClose, mealId, onSuccess }: EditMealModalProps) {
  const supabase = createClient()
  const [formData, setFormData] = useState({
    name: '',
    ingredients: '',
    instructions: '',
    video_url: '',
    cuisine_type: '',
    is_private: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (isOpen && mealId) {
      fetchMeal()
    }
  }, [isOpen, mealId])

  const fetchMeal = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('id', mealId)
        .single()

      if (error) throw error

      if (data) {
        setFormData({
          name: data.name || '',
          ingredients: data.ingredients || '',
          instructions: data.instructions || '',
          video_url: data.video_url || '',
          cuisine_type: data.cuisine_type || '',
          is_private: data.is_private || false,
        })
      }
    } catch (error) {
      console.error('Error fetching meal:', error)
      toast.error('Failed to load meal')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Meal name is required')
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('meals')
        .update({
          name: formData.name.trim(),
          ingredients: formData.ingredients.trim() || null,
          instructions: formData.instructions.trim() || null,
          video_url: formData.video_url.trim() || null,
          cuisine_type: formData.cuisine_type.trim() || null,
          is_private: formData.is_private,
        })
        .eq('id', mealId)

      if (error) throw error

      toast.success('Meal updated successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error updating meal:', error)
      toast.error(error.message || 'Failed to update meal')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meal? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)

      if (error) throw error

      toast.success('Meal deleted successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error deleting meal:', error)
      toast.error(error.message || 'Failed to delete meal')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Meal</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
            <p className="text-gray-600">Loading meal...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="md:flex md:items-center md:gap-4 space-y-2 md:space-y-0">
              <Label htmlFor="edit-name" className="md:w-32 md:flex-shrink-0">Meal Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="flex-1"
              />
            </div>

            {/* Cuisine Type */}
            <div className="md:flex md:items-center md:gap-4 space-y-2 md:space-y-0">
              <Label htmlFor="edit-cuisine" className="md:w-32 md:flex-shrink-0">Cuisine Type</Label>
              <Input
                id="edit-cuisine"
                value={formData.cuisine_type}
                onChange={(e) => setFormData({ ...formData, cuisine_type: e.target.value })}
                className="flex-1"
              />
            </div>

            {/* Ingredients */}
            <div className="space-y-2">
              <Label htmlFor="edit-ingredients">Ingredients</Label>
              <Textarea
                id="edit-ingredients"
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <Label htmlFor="edit-instructions">Instructions</Label>
              <Textarea
                id="edit-instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={4}
              />
            </div>

            {/* Video URL */}
            <div className="md:flex md:items-center md:gap-4 space-y-2 md:space-y-0">
              <Label htmlFor="edit-video" className="md:w-32 md:flex-shrink-0">YouTube Link</Label>
              <Input
                id="edit-video"
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                className="flex-1"
              />
            </div>

            {/* Privacy */}
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-600" />
                  <Label className="text-sm font-medium">Public Meal</Label>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_private: !formData.is_private })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                    !formData.is_private ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      !formData.is_private ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {!formData.is_private
                  ? 'Other users can see and use this meal in their plans'
                  : 'Only you can see this meal'}
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading || isSaving || isDeleting}
            className="mr-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isSaving || isDeleting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving || isDeleting}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
