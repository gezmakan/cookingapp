'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Globe } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CuisineAutocomplete from '@/components/CuisineAutocomplete'

export default function AddMealPage() {
  const [name, setName] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [cuisineType, setCuisineType] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Meal name is required')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to add meals')
        router.push('/login')
        return
      }

      const { error } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          name: name.trim(),
          ingredients: ingredients.trim() || null,
          instructions: instructions.trim() || null,
          video_url: videoUrl.trim() || null,
          cuisine_type: cuisineType.trim() || null,
          is_private: isPrivate,
        })

      if (error) throw error

      toast.success('Meal added successfully!')
      router.push('/meals')
    } catch (error: any) {
      console.error('Error adding meal:', error)
      toast.error(error.message || 'Failed to add meal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <Toaster />

      <div className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Add New Meal</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6 space-y-6">
          {/* Meal Name */}
          <div className="md:flex md:items-center md:gap-4 space-y-2 md:space-y-0">
            <Label htmlFor="name" className="text-sm font-medium md:w-32 md:flex-shrink-0">
              Meal Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-1"
            />
          </div>

          {/* Cuisine Type */}
          <div className="md:flex md:items-center md:gap-4 space-y-2 md:space-y-0">
            <Label htmlFor="cuisineType" className="text-sm font-medium md:w-32 md:flex-shrink-0">
              Cuisine Type
            </Label>
            <CuisineAutocomplete
              id="cuisineType"
              value={cuisineType}
              onChange={setCuisineType}
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <Label htmlFor="ingredients" className="text-sm font-medium">
              Ingredients
            </Label>
            <Textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows={6}
              className="w-full font-mono text-sm"
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-sm font-medium">
              Instructions
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={6}
              className="w-full"
            />
          </div>

          {/* YouTube Link */}
          <div className="md:flex md:items-center md:gap-4 space-y-2 md:space-y-0">
            <Label htmlFor="videoUrl" className="text-sm font-medium md:w-32 md:flex-shrink-0">
              YouTube Link
            </Label>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Privacy Setting */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-600" />
                <Label className="text-sm font-medium">Public Meal</Label>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                  !isPrivate ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    !isPrivate ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {!isPrivate
                ? 'Other users can see and use this meal in their plans'
                : 'Only you can see this meal'}
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isSubmitting ? 'Adding...' : 'Add Meal'}
            </Button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  )
}
