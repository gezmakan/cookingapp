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

// Detect video platform
function getVideoPlatform(url: string): 'youtube' | 'tiktok' | 'unknown' {
  if (!url) return 'unknown'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('tiktok.com')) return 'tiktok'
  return 'unknown'
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

// Extract TikTok video ID and create embed URL
function getTikTokEmbedUrl(url: string): string {
  if (!url) return ''

  // Handle different TikTok URL formats
  // https://www.tiktok.com/@username/video/1234567890
  // https://vm.tiktok.com/shortcode
  const videoIdMatch = url.match(/\/video\/(\d+)/)
  if (videoIdMatch && videoIdMatch[1]) {
    return `https://www.tiktok.com/embed/v2/${videoIdMatch[1]}`
  }

  return url
}

export default function VideoModal({ isOpen, onClose, videoUrl, title, meal }: VideoModalProps) {
  const platform = getVideoPlatform(videoUrl)
  const embedUrl = platform === 'youtube'
    ? getYouTubeEmbedUrl(videoUrl)
    : platform === 'tiktok'
    ? getTikTokEmbedUrl(videoUrl)
    : videoUrl

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:!max-w-[1200px] lg:!max-w-[1400px] w-[90vw] h-[calc(100dvh-2rem)] max-h-[calc(100dvh-2rem)] md:h-auto md:max-h-[90vh] overflow-y-auto overflow-x-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className={`flex flex-col ${meal && (meal.ingredients || meal.instructions) ? 'md:flex-row md:gap-6' : ''} flex-1 overflow-hidden`}>
          <div
            className={`flex-shrink-0 ${platform === 'tiktok' ? 'w-full max-w-sm mx-auto' : 'w-full'} ${meal && (meal.ingredients || meal.instructions) ? 'md:basis-1/2 lg:basis-[52%]' : ''}`}
            style={{ aspectRatio: platform === 'tiktok' ? '9/16' : '16/9' }}
          >
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full rounded"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {meal && (meal.ingredients || meal.instructions) && (
            <div className="mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 md:border-l md:pl-6 flex-1 overflow-y-auto space-y-4">
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
