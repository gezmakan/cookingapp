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
import { ArrowLeft, Trash2, Video, Lock } from 'lucide-react'
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
  is_private: boolean
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

  const fetchUserEmailsRpc = async () => {
    const { data, error } = await supabase.rpc('get_user_emails')
    if (!error) return data

    const { data: fallbackData, error: fallbackError } = await supabase.rpc('get_all_user_emails')
    if (fallbackError) throw fallbackError
    return fallbackData
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

      // Get all user emails using the admin function
      const userEmails = await fetchUserEmailsRpc()

      // Create users list with all users who have meals
      const usersList: User[] = (userEmails || []).map((u: any) => ({
        id: u.user_id,
        email: u.email || 'Unknown',
        created_at: u.created_at || new Date().toISOString(),
        meal_count: userMealCounts[u.user_id] || 0,
      }))

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

      // Get all user emails using the admin function
      const userEmails = await fetchUserEmailsRpc()

      // Create a map of user_id to email
      const emailMap: { [key: string]: string } = {}
      userEmails?.forEach((u: any) => {
        emailMap[u.user_id] = u.email
      })

      // Add user email info
      const mealsWithUsers = data?.map(meal => ({
        ...meal,
        user_email: emailMap[meal.user_id] || 'Unknown'
      })) || []

      setMeals(mealsWithUsers)
    } catch (error) {
      console.error('Error fetching meals:', error)
    }
  }

  const forcePrivate = async (mealId: string, currentPrivate: boolean) => {
    if (currentPrivate) {
      alert('This meal is already private')
      return
    }

    if (!confirm('Force this meal to be private? The user will not be able to make it public again unless you change it.')) return

    try {
      const { error } = await supabase
        .from('meals')
        .update({ is_private: true })
        .eq('id', mealId)

      if (error) throw error

      await fetchAllMeals()
      alert('Meal is now private')
    } catch (error) {
      console.error('Error forcing meal private:', error)
      alert('Failed to update meal')
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

  const deleteUser = async (userToDelete: User) => {
    if (!confirm(`Delete ${userToDelete.email} and all of their data? This cannot be undone.`)) return
    try {
      const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userToDelete.id })
      if (error) throw error
      await Promise.all([fetchUsers(), fetchAllMeals()])
      alert('User deleted successfully.')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
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
                    <TableHead>Privacy</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {meals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
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
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            meal.is_private
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {meal.is_private ? 'Private' : 'Public'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            {!meal.is_private && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => forcePrivate(meal.id, meal.is_private)}
                                className="text-orange-600 hover:text-orange-700 border-orange-300"
                              >
                                <Lock className="h-4 w-4 mr-1" />
                                Force Private
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteMeal(meal.id)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                        No users found
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
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 disabled:opacity-40"
                            onClick={() => deleteUser(user)}
                            disabled={isAdmin(user.email)}
                            title={isAdmin(user.email) ? 'Cannot delete primary admin' : 'Delete user'}
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
        </Tabs>
      </div>

      {selectedVideo && (
        <VideoModal
          isOpen={true}
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  )
}
