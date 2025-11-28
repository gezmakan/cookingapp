'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function Footer() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <footer className="bg-white border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 space-y-2">
        <div className="flex flex-col items-center gap-2 text-xs text-gray-500">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold">
            <Link
              href="/meals"
              className={`${
                pathname === '/meals' ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Meal Library
            </Link>
            {user && (
              <Link
                href="/plan"
                className={`${
                  pathname === '/plan' ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'
                }`}
              >
                Meal Plan
              </Link>
            )}
            <Link
              href={user ? '/meals/add' : '/signup'}
              className={`${
                pathname === (user ? '/meals/add' : '/signup') ? 'text-orange-600' : 'text-gray-700 hover:text-orange-600'
              }`}
            >
              Add Recipe
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 flex-wrap mt-4">
            {user && (
              <Link
                href="/settings"
                className={`${
                  pathname === '/settings' ? 'text-orange-600' : 'hover:text-orange-600'
                }`}
              >
                Settings
              </Link>
            )}
            <Link
              href="/terms"
              className={`${
                pathname === '/terms' ? 'text-orange-600' : 'hover:text-orange-600'
              }`}
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className={`${
                pathname === '/privacy' ? 'text-orange-600' : 'hover:text-orange-600'
              }`}
            >
              Privacy
            </Link>
            <Link
              href="/about"
              className={`${
                pathname === '/about' ? 'text-orange-600' : 'hover:text-orange-600'
              }`}
            >
              About
            </Link>
          </div>
        </div>
        <div className="text-center text-xs text-gray-400 space-y-3 pt-4 pb-2">
          {user && (
            <p className="text-gray-500">
              Logged in as <span className="font-medium text-gray-700">{user.email}</span>{' '}
              (<button
                onClick={handleLogout}
                className="text-orange-600 hover:underline"
              >
                logout
              </button>)
            </p>
          )}
          <p>© Yummii</p>
        </div>
      </div>
    </footer>
  )
}
