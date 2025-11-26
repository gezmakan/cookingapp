'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AddMealPage() {
  const [name, setName] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [cuisineType, setCuisineType] = useState('')
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
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Meal Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Chicken Tikka Masala"
              required
              className="w-full"
            />
          </div>

          {/* Cuisine Type */}
          <div className="space-y-2">
            <Label htmlFor="cuisineType" className="text-sm font-medium">
              Cuisine Type <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="cuisineType"
              type="text"
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
              placeholder="e.g., Indian, Italian, Mexican"
              className="w-full"
            />
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <Label htmlFor="ingredients" className="text-sm font-medium">
              Ingredients <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <Textarea
              id="ingredients"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g.,&#10;- 2 lbs chicken breast&#10;- 1 cup yogurt&#10;- 2 tbsp garam masala&#10;- 1 onion, diced"
              rows={6}
              className="w-full font-mono text-sm"
            />
            <p className="text-xs text-gray-500">List ingredients one per line or however you prefer</p>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions" className="text-sm font-medium">
              Instructions <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g.,&#10;1. Marinate chicken in yogurt and spices for 2 hours&#10;2. Grill on high heat for 6-7 minutes per side&#10;3. Serve with naan and rice"
              rows={6}
              className="w-full"
            />
            <p className="text-xs text-gray-500">Step-by-step cooking instructions</p>
          </div>

          {/* YouTube Link */}
          <div className="space-y-2">
            <Label htmlFor="videoUrl" className="text-sm font-medium">
              YouTube Video Link <span className="text-gray-400 text-xs">(optional)</span>
            </Label>
            <Input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full"
            />
            <p className="text-xs text-gray-500">Link to a cooking tutorial video</p>
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
