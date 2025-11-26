'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'
import { jwtDecode } from 'jwt-decode'

type LoginFormProps = {
  initialMode?: 'login' | 'signup'
}

export default function LoginForm({ initialMode = 'login' }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
  const [linkingGoogle, setLinkingGoogle] = useState<{ email: string; sub: string } | null>(null)
  const [linkPassword, setLinkPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (isSignUp) {
        // Validate passwords match
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error

        // Automatically log in and go to planner
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (signInError) throw signInError

        setSuccess('Account created! Redirecting you to your meal library...')
        router.push('/meals')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/meals')
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkGoogleAccount = async () => {
    if (!linkingGoogle) return

    setIsLoading(true)
    setError(null)

    try {
      // Verify password by signing in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: linkingGoogle.email,
        password: linkPassword,
      })

      if (signInError) {
        setError('Incorrect password. Please try again.')
        setIsLoading(false)
        return
      }

      // Password is correct, now update user's password to also accept Google password
      const googlePassword = `google_${linkingGoogle.sub}`

      // Update the user's password to the Google one
      const { error: updateError } = await supabase.auth.updateUser({
        password: googlePassword,
      })

      if (updateError) throw updateError

      // Create the Google link
      await supabase.from('google_account_links').insert({
        user_id: signInData.user.id,
        google_sub: linkingGoogle.sub,
      })

      setSuccess('Google account linked! You can now sign in with Google. Redirecting...')
      setLinkingGoogle(null)
      setLinkPassword('')

      setTimeout(() => {
        router.push('/meals')
        router.refresh()
      }, 1000)
    } catch (error: any) {
      setError(error.message || 'Failed to link Google account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true)
      setError(null)

      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        })

        const userInfo = await userInfoResponse.json()
        const googleSub = userInfo.sub
        const googlePassword = `google_${googleSub}`

        // Try to sign in with Google-based password
        let { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: userInfo.email,
          password: googlePassword,
        })

        if (signInError) {
          // User doesn't exist with Google password, try to create account
          const { data: newUser, error: signUpError } = await supabase.auth.signUp({
            email: userInfo.email,
            password: googlePassword,
          })

          if (signUpError) {
            // Email already registered with different password
            if (signUpError.message.includes('already registered')) {
              // Prompt user to enter their password to link accounts
              setLinkingGoogle({ email: userInfo.email, sub: googleSub })
              setIsLoading(false)
              return
            } else {
              setError(signUpError.message)
              setIsLoading(false)
              return
            }
          }

          // Sign in the new user
          const { data: signedInUser, error: newSignInError } = await supabase.auth.signInWithPassword({
            email: userInfo.email,
            password: googlePassword,
          })

          if (newSignInError) throw newSignInError

          // Create the Google link for new user
          if (signedInUser.user) {
            await supabase.from('google_account_links').insert({
              user_id: signedInUser.user.id,
              google_sub: googleSub,
            })
          }
        } else {
          // Successfully signed in, make sure link exists
          if (signInData.user) {
            const { data: existingLink } = await supabase
              .from('google_account_links')
              .select('*')
              .eq('user_id', signInData.user.id)
              .eq('google_sub', googleSub)
              .single()

            if (!existingLink) {
              await supabase.from('google_account_links').insert({
                user_id: signInData.user.id,
                google_sub: googleSub,
              })
            }
          }
        }

        setSuccess('Signed in with Google! Redirecting...')
        router.push('/meals')
        router.refresh()
      } catch (error: any) {
        setError(error.message || 'Failed to sign in with Google')
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => {
      setError('Failed to sign in with Google')
    },
  })

  useEffect(() => {
    setIsSignUp(initialMode === 'signup')
  }, [initialMode])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-0">
      <Card className="w-full max-w-md border-0 md:border shadow-none md:shadow-sm">
        <CardHeader>
          <CardTitle>
            {linkingGoogle
              ? 'Link Google Account'
              : isSignUp
              ? 'Create Account'
              : 'Login'}
          </CardTitle>
          <CardDescription>
            {linkingGoogle
              ? `Enter your password for ${linkingGoogle.email} to link your Google account`
              : isSignUp
              ? 'Sign up to start planning your meals'
              : 'Sign in to your meal planner account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkingGoogle ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="linkPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-green-700 bg-green-50 p-3 rounded">
                  {success}
                </div>
              )}
              <Button
                type="button"
                className="w-full"
                onClick={handleLinkGoogleAccount}
                disabled={isLoading}
              >
                {isLoading ? 'Linking...' : 'Link Google Account'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setLinkingGoogle(null)
                  setLinkPassword('')
                  setError(null)
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="text-sm text-green-700 bg-green-50 p-3 rounded">
                {success}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => handleGoogleLogin()}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:underline"
              >
                {isSignUp
                  ? 'Already have an account? Login'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


