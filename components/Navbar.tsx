'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

type NavbarProps = {
  searchQuery?: string
  onSearchChange?: (value: string) => void
}

export default function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const [user, setUser] = useState<any>(null)
  const [userChecked, setUserChecked] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  const isMealsPage = pathname === '/meals'

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
      <div className="max-w-5xl xl:max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between gap-4 h-14">
          <Link
            href="/plan"
            className="flex items-center gap-1 md:gap-2 font-semibold text-gray-800 text-sm md:text-lg shrink-0"
          >
            <span role="img" aria-label="cooking" className="text-base md:text-xl">👨‍🍳</span>
            <span>Yummii</span>
          </Link>

          <div className="flex items-center gap-3 flex-1 justify-end">
            {isMealsPage && onSearchChange && (
              <div className="relative w-40">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search meals..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 w-full h-9"
                />
              </div>
            )}

            {userChecked && !user && (
              <>
                <Link
                  href="/signup"
                  className="text-sm font-medium whitespace-nowrap px-5 py-1.5 rounded-full transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="text-sm font-medium whitespace-nowrap px-5 py-1.5 rounded-full transition-colors bg-gray-900 text-white hover:bg-gray-800"
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
