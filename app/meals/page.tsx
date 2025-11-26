'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Video, Search, ArrowUpDown } from 'lucide-react'
import VideoModal from '@/components/VideoModal'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

type Meal = {
  id: string
  user_id: string
  name: string
  ingredients: string | null
  instructions: string | null
  video_url: string | null
  cuisine_type: string | null
  created_at: string
}

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string; meal?: Meal } | null>(null)
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const router = useRouter()
  const supabase = createClient()

  const MEALS_PER_PAGE = 30

  // Fuzzy match function
  const fuzzyMatch = (text: string, search: string): number => {
    text = text.toLowerCase()
    search = search.toLowerCase()

    if (text.includes(search)) {
      return 1000
    }

    let searchIndex = 0
    let textIndex = 0
    let consecutiveMatches = 0
    let score = 0

    while (textIndex < text.length && searchIndex < search.length) {
      if (text[textIndex] === search[searchIndex]) {
        searchIndex++
        consecutiveMatches++
        score += consecutiveMatches * 10
      } else {
        consecutiveMatches = 0
      }
      textIndex++
    }

    if (searchIndex === search.length) {
      return score
    }

    return 0
  }

  // Filter and sort meals
  const filteredMeals = meals
    .map(meal => ({
      meal,
      score: Math.max(
        fuzzyMatch(meal.name, searchQuery),
        fuzzyMatch(meal.cuisine_type || '', searchQuery),
        fuzzyMatch(meal.ingredients || '', searchQuery)
      )
    }))
    .filter(({ score }) => score > 0 || searchQuery === '')
    .sort((a, b) => {
      if (searchQuery) {
        if (b.score !== a.score) {
          return b.score - a.score
        }
      }
      if (sortOrder === 'asc') {
        return a.meal.name.localeCompare(b.meal.name)
      } else {
        return b.meal.name.localeCompare(a.meal.name)
      }
    })
    .map(({ meal }) => meal)

  const displayedMeals = showAll ? filteredMeals : filteredMeals.slice(0, MEALS_PER_PAGE)

  useEffect(() => {
    checkUser()
    fetchMeals()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMeals(data || [])
    } catch (error) {
      console.error('Error fetching meals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-2xl md:text-3xl font-semibold text-gray-700">
        <span role="img" aria-label="cooking" className="mr-3">👨‍🍳</span>
        Loading recipes...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 flex-1 w-full md:p-8 pt-4">
        <div className="mb-4 md:mb-8">
          <div className="flex items-center justify-between gap-3 mt-2 md:mt-4">
            <h1 className="text-2xl md:text-3xl font-bold">Meal Library</h1>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search meals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            {user ? (
              <Button onClick={() => router.push('/meals/add')} size="sm" variant="outline" className="md:h-10 flex-shrink-0">
                <Plus className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Add Meal</span>
                <span className="md:hidden">Add</span>
              </Button>
            ) : (
              <Button onClick={() => router.push('/signup')} size="sm" className="md:h-10 flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Add More</span>
                <span className="md:hidden">Add</span>
              </Button>
            )}
          </div>
        </div>

        {meals.length === 0 ? (
          <div className="text-center py-12 bg-white md:rounded-lg border-y md:border -mx-4 md:mx-0">
            <p className="text-gray-600 mb-4">No meals yet. Add your first meal!</p>
            <Button onClick={() => router.push('/meals/add')} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Add Meal
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white md:rounded-lg border-y md:border -mx-4 md:mx-0 px-4 py-3 mb-4 flex items-center justify-between">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
              >
                <ArrowUpDown className="h-4 w-4" />
                Sort {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
              </button>
              <span className="text-sm text-gray-600">
                {filteredMeals.length} meal{filteredMeals.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 -mx-4 md:mx-0">
              {displayedMeals.map((meal) => {
                // Extract YouTube video ID for thumbnail
                const getYouTubeThumbnail = (url: string) => {
                  const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
                  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
                }

                const thumbnail = meal.video_url ? getYouTubeThumbnail(meal.video_url) : null

                return (
                  <div
                    key={meal.id}
                    className="bg-white border-y md:border md:rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
                      {thumbnail ? (
                        <button
                          onClick={() => setSelectedVideo({ url: meal.video_url!, title: meal.name, meal })}
                          className="w-full h-full"
                        >
                          <img
                            src={thumbnail}
                            alt={meal.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                              <Video className="h-8 w-8 text-orange-600" />
                            </div>
                          </div>
                        </button>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl opacity-50">🍽️</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 flex-1">
                          {meal.name}
                        </h3>
                        {user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMealId(meal.id)}
                            className="flex-shrink-0 hover:bg-orange-50 text-gray-600 hover:text-orange-600 -mt-1"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      {meal.cuisine_type && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          {meal.cuisine_type}
                        </span>
                      )}

                      {meal.ingredients && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {meal.ingredients.split('\n')[0]}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredMeals.length > MEALS_PER_PAGE && (
              <div className="text-center mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  size="sm"
                >
                  {showAll ? 'Show Less' : `Show All (${filteredMeals.length} meals)`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      {selectedVideo && (
        <VideoModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
        />
      )}
    </div>
  )
}
