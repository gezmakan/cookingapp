'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/admin'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Trash2, Video } from 'lucide-react'
import VideoModal from '@/components/VideoModal'

type User = {
  id: string
  email: string
  created_at: string
  meal_count: number
}

type Meal = {
  id: string
  name: string
  cuisine_type: string | null
  ingredients: string | null
  instructions: string | null
  video_url: string | null
  user_id: string
  created_at: string
  user_email: string | null
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [meals, setMeals] = useState<Meal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  const checkAdminAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isAdmin(user.email)) {
      router.push('/meals')
      return
    }

    setCurrentUser(user)
    await Promise.all([
      fetchUsers(),
      fetchAllMeals()
    ])
    setIsLoading(false)
  }

  const fetchUsers = async () => {
    try {
      const { data: mealsData, error } = await supabase
        .from('meals')
        .select('user_id')

      if (error) throw error

      // Count meals per user
      const userMealCounts: { [key: string]: number } = {}
      mealsData?.forEach(meal => {
        if (meal.user_id) {
          userMealCounts[meal.user_id] = (userMealCounts[meal.user_id] || 0) + 1
        }
      })

      // Get current user info
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      // For now, we'll show the current user if they have meals
      const usersList: User[] = []

      if (currentUser && userMealCounts[currentUser.id]) {
        usersList.push({
          id: currentUser.id,
          email: currentUser.email || 'Unknown',
          created_at: currentUser.created_at || new Date().toISOString(),
          meal_count: userMealCounts[currentUser.id]
        })
      }

      setUsers(usersList)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchAllMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get current user info
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      // Add user email info
      const mealsWithUsers = data?.map(meal => ({
        ...meal,
        user_email: meal.user_id === currentUser?.id ? currentUser.email : 'Unknown'
      })) || []

      setMeals(mealsWithUsers)
    } catch (error) {
      console.error('Error fetching meals:', error)
    }
  }

  const deleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return

    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId)

      if (error) throw error

      await fetchAllMeals()
      await fetchUsers()
    } catch (error) {
      console.error('Error deleting meal:', error)
      alert('Failed to delete meal')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <p className="text-gray-600">Loading admin panel...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/meals')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Meals
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage users and meals</p>
        </div>

        <Tabs defaultValue="meals" className="space-y-6">
          <TabsList>
            <TabsTrigger value="meals">All Meals</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="meals">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Cuisine</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Video</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No meals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    meals.map((meal) => (
                      <TableRow key={meal.id}>
                        <TableCell className="font-medium">{meal.name}</TableCell>
                        <TableCell>
                          {meal.cuisine_type && (
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                              {meal.cuisine_type}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {meal.user_email}
                        </TableCell>
                        <TableCell>
                          {meal.video_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedVideo({ url: meal.video_url!, title: meal.name })}
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(meal.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMeal(meal.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Meals</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                        No users with meals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.meal_count}</TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedVideo && (
        <VideoModal
          url={selectedVideo.url}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  )
}
