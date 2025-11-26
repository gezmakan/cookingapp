'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [userChecked, setUserChecked] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    setUser(data.user)
    setUserChecked(true)
  }

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-3 h-14">
          <Link
            href="/meals"
            className="flex items-center gap-1 md:gap-2 font-semibold text-gray-800 text-sm md:text-lg"
          >
            <span role="img" aria-label="cooking" className="text-base md:text-xl">👨‍🍳</span>
            <span>CookMe</span>
          </Link>

          <div className="flex items-center gap-2">
            {userChecked && !user && (
              <>
                <Link
                  href="/signup"
                  className="text-sm font-medium whitespace-nowrap px-4 py-1.5 rounded-full transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium whitespace-nowrap px-4 py-1.5 rounded-full transition-colors bg-gray-900 text-white hover:bg-gray-800"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
