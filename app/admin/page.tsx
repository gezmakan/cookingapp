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
  exercise_count: number
}

type Exercise = {
  id: string
  name: string
  sets: number
  reps: string
  video_url: string | null
  muscle_groups: string | null
  rest_minutes: number
  rest_seconds: number
  is_private: boolean
  user_id: string | null
  created_at: string
  user_email: string | null
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [exercises, setExercises] = useState<Exercise[]>([])
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
      router.push('/exercises')
      return
    }

    setCurrentUser(user)
    await Promise.all([fetchUsers(), fetchAllExercises()])
    setIsLoading(false)
  }

  const fetchUsers = async () => {
    try {
      // Get all users with their exercise counts
      const { data: usersData, error: usersError } = await supabase
        .from('exercises')
        .select('user_id')

      if (usersError) throw usersError

      // Count exercises per user
      const userExerciseCounts: Record<string, number> = {}
      usersData?.forEach((ex) => {
        if (ex.user_id) {
          userExerciseCounts[ex.user_id] = (userExerciseCounts[ex.user_id] || 0) + 1
        }
      })

      // Get current user info
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      // For now, we'll show the current user if they have exercises
      const usersList: User[] = []

      if (currentUser && userExerciseCounts[currentUser.id]) {
        usersList.push({
          id: currentUser.id,
          email: currentUser.email || 'Unknown',
          created_at: currentUser.created_at || new Date().toISOString(),
          exercise_count: userExerciseCounts[currentUser.id]
        })
      }

      setUsers(usersList)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const fetchAllExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Get current user info
      const { data: { user: currentUser } } = await supabase.auth.getUser()

      // Add user email info
      const exercisesWithUsers = data?.map(ex => ({
        ...ex,
        user_email: ex.user_id
          ? (currentUser?.id === ex.user_id ? currentUser?.email : ex.user_id.substring(0, 8) + '...')
          : 'Public'
      }))

      setExercises(exercisesWithUsers || [])
    } catch (error) {
      console.error('Error fetching exercises:', error)
    }
  }

  const handleDeleteExercise = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) return

    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchAllExercises()
      await fetchUsers()
    } catch (error) {
      console.error('Error deleting exercise:', error)
      alert('Failed to delete exercise')
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-8 p-4 md:p-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">Manage users and exercises</p>
          </div>
          <Button variant="outline" onClick={() => router.push('/exercises')} size="sm" className="md:h-10">
            <ArrowLeft className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Back to Exercises</span>
          </Button>
        </div>

        <Tabs defaultValue="exercises" className="space-y-4">
          <TabsList className="mx-4 md:mx-0">
            <TabsTrigger value="exercises">Exercises</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="exercises" className="space-y-4">
            <div className="bg-white md:rounded-lg border-y md:border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">All Exercises</h2>
                <p className="text-sm text-gray-600">Manage all public and private exercises</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Sets</TableHead>
                    <TableHead>Reps</TableHead>
                    <TableHead>Muscle Groups</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exercises.map((exercise) => (
                    <TableRow key={exercise.id}>
                      <TableCell className="font-medium">
                        {exercise.video_url ? (
                          <button
                            onClick={() => setSelectedVideo({ url: exercise.video_url!, title: exercise.name })}
                            className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                          >
                            {exercise.name}
                          </button>
                        ) : (
                          exercise.name
                        )}
                      </TableCell>
                      <TableCell>{exercise.sets}</TableCell>
                      <TableCell>{exercise.reps}</TableCell>
                      <TableCell>{exercise.muscle_groups || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded ${exercise.is_private ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {exercise.is_private ? 'Private' : 'Public'}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {exercise.user_email}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExercise(exercise.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="bg-white md:rounded-lg border-y md:border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Users</h2>
                <p className="text-sm text-gray-600">View all registered users</p>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Exercises Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-gray-500">
                        No users with exercises found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-sm">{user.email}</TableCell>
                        <TableCell>{user.exercise_count}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 md:px-0">
              <div className="bg-white md:rounded-lg border-y md:border p-6">
                <h3 className="text-sm font-medium text-gray-600">Total Exercises</h3>
                <p className="text-3xl font-bold mt-2">{exercises.length}</p>
              </div>
              <div className="bg-white md:rounded-lg border-y md:border p-6">
                <h3 className="text-sm font-medium text-gray-600">Public Exercises</h3>
                <p className="text-3xl font-bold mt-2">
                  {exercises.filter(e => !e.is_private).length}
                </p>
              </div>
              <div className="bg-white md:rounded-lg border-y md:border p-6">
                <h3 className="text-sm font-medium text-gray-600">Private Exercises</h3>
                <p className="text-3xl font-bold mt-2">
                  {exercises.filter(e => e.is_private).length}
                </p>
              </div>
              <div className="bg-white md:rounded-lg border-y md:border p-6">
                <h3 className="text-sm font-medium text-gray-600">Users with Exercises</h3>
                <p className="text-3xl font-bold mt-2">{users.length}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

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
