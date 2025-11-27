'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Edit, Video, Search, Lock, Globe, Sparkles } from 'lucide-react'
import VideoModal from '@/components/VideoModal'
import EditMealModal from '@/components/EditMealModal'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { Toaster } from '@/components/ui/sonner'

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

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string; meal?: Meal } | null>(null)
  const [editingMealId, setEditingMealId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null)
  const [showMineOnly, setShowMineOnly] = useState(false)
  const [filtersLoaded, setFiltersLoaded] = useState(false)
  const manualFilterChangeRef = useRef(false)
  const router = useRouter()
  const supabase = createClient()

  const MEALS_PER_PAGE = 30

  // Get unique cuisine types from meals
  const uniqueCuisineTypes = Array.from(
    new Set(meals.map(meal => meal.cuisine_type).filter(Boolean))
  ).sort() as string[]

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

  // Filter meals
  const filteredMeals = meals
    .filter(meal => {
      if (showMineOnly) {
        if (!user) {
          return false
        }
        if (meal.user_id !== user.id) {
          return false
        }
      }
      // Filter by cuisine type if selected
      if (selectedCuisine && meal.cuisine_type !== selectedCuisine) {
        return false
      }
      return true
    })
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
      // Only sort by search score when searching
      if (searchQuery && b.score !== a.score) {
        return b.score - a.score
      }
      // Otherwise keep original order (most recent first from DB)
      return 0
    })
    .map(({ meal }) => meal)

  const displayedMeals = showAll ? filteredMeals : filteredMeals.slice(0, MEALS_PER_PAGE)
  const handlePrimaryCta = () => {
    router.push(user ? '/meals/add' : '/signup')
  }
  const primaryCtaLabel = user ? 'Add Recipe' : 'Join to Add'

  useEffect(() => {
    checkUser()
    fetchMeals()
  }, [])

  useEffect(() => {
    const loadFilterPreferences = async () => {
      if (!user) {
        setFiltersLoaded(true)
        return
      }
      setFiltersLoaded(false)
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('meal_filter_cuisine, meal_filter_show_mine, meal_filter_search')
          .eq('user_id', user.id)
          .single()

        if (!error && data && !manualFilterChangeRef.current) {
          setSelectedCuisine(data.meal_filter_cuisine || null)
          setShowMineOnly(!!data.meal_filter_show_mine)
          setSearchQuery(data.meal_filter_search || '')
        }
      } catch (error) {
        console.error('Error loading meal filter preferences:', error)
      } finally {
        setFiltersLoaded(true)
      }
    }

    loadFilterPreferences()
  }, [user])

  useEffect(() => {
    if (!user && showMineOnly) {
      setShowMineOnly(false)
    }
  }, [user, showMineOnly])

  useEffect(() => {
    if (!user) return
    if (!filtersLoaded && !manualFilterChangeRef.current) return

    const persistFilters = async () => {
      try {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: user.id,
            meal_filter_cuisine: selectedCuisine,
            meal_filter_show_mine: showMineOnly,
            meal_filter_search: searchQuery,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
        manualFilterChangeRef.current = false
      } catch (error) {
        console.error('Error saving meal filter preferences:', error)
      }
    }

    persistFilters()
  }, [selectedCuisine, showMineOnly, searchQuery, user, filtersLoaded])

  const handleSelectCuisine = (cuisine: string | null) => {
    manualFilterChangeRef.current = true
    setSelectedCuisine(cuisine)
  }

  const handleToggleMineOnly = () => {
    manualFilterChangeRef.current = true
    setShowMineOnly((prev) => !prev)
  }

  const handleSearchChange = (value: string) => {
    manualFilterChangeRef.current = true
    setSearchQuery(value)
  }

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
      <Navbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
      <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 flex-1 w-full md:p-8 pt-4">
        <div className="mb-5 md:mb-10">
          <div className="relative overflow-hidden rounded-3xl bg-[#1c120a] text-white px-6 py-8 md:px-10 md:py-12 shadow-[0px_30px_80px_rgba(0,0,0,0.25)]">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-900/80 via-orange-600/70 to-rose-500/70" />
              <div className="absolute -right-8 top-0 w-64 h-64 bg-orange-200/40 blur-3xl" />
              <div className="absolute -left-8 bottom-0 w-64 h-64 bg-rose-200/30 blur-3xl" />
              <div
                className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)' }}
              />
            </div>
            <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">Your Recipe Hub</p>
                <div className="flex items-center gap-3 mt-2">
                  <h1 className="text-3xl md:text-4xl font-semibold">Recipes</h1>
                  <Sparkles className="h-6 w-6 text-orange-200" />
                </div>
                <p className="text-base md:text-lg text-white/80 mt-3">
                  Save every favorite dish, tweak the details, and keep your go-to recipes in one place.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="mb-4 md:hidden">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search meals..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
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
            <div className="bg-white md:rounded-lg border-y md:border -mx-4 md:mx-0 px-4 py-3 mb-4 flex items-center justify-between gap-3 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                <button
                  onClick={() => handleSelectCuisine(null)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    selectedCuisine === null
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                {uniqueCuisineTypes.map(cuisine => (
                  <button
                    key={cuisine}
                    onClick={() => handleSelectCuisine(cuisine)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                      selectedCuisine === cuisine
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
                {user && (
                  <button
                    onClick={handleToggleMineOnly}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap border ${
                      showMineOnly
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                    }`}
                  >
                    My Recipes
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedMeals.map((meal) => {
                // Detect platform
                const isTikTok = meal.video_url?.includes('tiktok.com')
                const isYouTube = meal.video_url && (meal.video_url.includes('youtube.com') || meal.video_url.includes('youtu.be'))

                // Extract YouTube video ID for thumbnail
                const getYouTubeThumbnail = (url: string) => {
                  const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
                  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null
                }

                const thumbnail = isYouTube ? getYouTubeThumbnail(meal.video_url!) : null
                const hasVideo = !!(meal.video_url && (isYouTube || isTikTok))

                return (
                  <div
                    key={meal.id}
                    className="bg-white border rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gradient-to-br from-orange-100 to-orange-200 overflow-hidden">
                      {hasVideo ? (
                        <button
                          onClick={() => setSelectedVideo({ url: meal.video_url!, title: meal.name, meal })}
                          className="w-full h-full"
                        >
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={meal.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : isTikTok ? (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-100 to-blue-100">
                              <span className="text-6xl">🎵</span>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-6xl opacity-50">🍽️</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <div className="px-6 py-4 rounded-lg bg-red-600/50 flex items-center justify-center shadow-lg group-hover:bg-red-600/70 transition-colors">
                              <div className="w-0 h-0 border-l-[14px] border-l-white border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent ml-1"></div>
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
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap flex-1">
                          <h3
                            className={`font-semibold text-lg text-gray-900 ${
                              hasVideo ? 'cursor-pointer hover:text-orange-600 transition-colors' : ''
                            }`}
                            onClick={() => {
                              if (hasVideo) {
                                setSelectedVideo({ url: meal.video_url!, title: meal.name, meal })
                              }
                            }}
                          >
                            {meal.name}
                          </h3>
                          {meal.cuisine_type && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                              {meal.cuisine_type}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            meal.is_private
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-green-100 text-green-700'
                          }`} title={meal.is_private ? 'Private' : 'Public'}>
                            {meal.is_private ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                          </span>
                        </div>
                        {user && user.id === meal.user_id && (
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

            <div className="flex justify-center mt-10 pb-6">
              <Button
                className="bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg hover:from-orange-600 hover:to-rose-600 border-0"
                onClick={handlePrimaryCta}
              >
                <Plus className="h-4 w-4 mr-2" />
                {primaryCtaLabel}
              </Button>
            </div>
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
          meal={selectedVideo.meal}
        />
      )}

      {editingMealId && (
        <EditMealModal
          isOpen={!!editingMealId}
          onClose={() => setEditingMealId(null)}
          mealId={editingMealId}
          onSuccess={fetchMeals}
        />
      )}

      <Toaster />
    </div>
  )
}
