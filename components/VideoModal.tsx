'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

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

type VideoModalProps = {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
  meal?: Meal
}

// Convert YouTube URL to embed URL
function getYouTubeEmbedUrl(url: string): string {
  if (!url) return ''

  // Handle different YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
  const match = url.match(regExp)
  const videoId = match && match[2].length === 11 ? match[2] : null

  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}

export default function VideoModal({ isOpen, onClose, videoUrl, title, meal }: VideoModalProps) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-[960px] w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full rounded"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        {meal && (meal.ingredients || meal.instructions) && (
          <div className="mt-4 pt-4 border-t space-y-4">
            {meal.ingredients && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Ingredients</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded">
                  {meal.ingredients}
                </pre>
              </div>
            )}
            {meal.instructions && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Instructions</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                  {meal.instructions}
                </pre>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
