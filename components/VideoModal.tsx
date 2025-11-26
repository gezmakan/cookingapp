'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Exercise = {
  sets: number
  reps: string
  rest_minutes: number
  rest_seconds: number
  muscle_groups: string | null
}

type VideoModalProps = {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  title: string
  exercise?: Exercise
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

export default function VideoModal({ isOpen, onClose, videoUrl, title, exercise }: VideoModalProps) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-[960px] w-[90vw]">
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
        {exercise && (
          <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600 font-medium">Sets:</span>
              <span className="ml-2">{exercise.sets}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Reps:</span>
              <span className="ml-2">{exercise.reps}</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Rest:</span>
              <span className="ml-2">{exercise.rest_minutes}m {exercise.rest_seconds}s</span>
            </div>
            <div>
              <span className="text-gray-600 font-medium">Muscle Groups:</span>
              <span className="ml-2">{exercise.muscle_groups || '-'}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
