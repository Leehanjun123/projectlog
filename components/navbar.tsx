'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NotificationBell } from './notification-bell'
import { Button } from './ui/button'
import { useState } from 'react'

interface NavItem {
  name: string
  href: string
  icon: string
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Community', href: '/feed', icon: '🌍' },
  { name: 'Projects', href: '/projects/new', icon: '📁' },
  { name: 'Search', href: '/search', icon: '🔍' },
]

export function Navbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
              ProjectLog
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                </Link>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link href="/settings" className="hidden sm:block">
              <Button variant="outline" size="sm">
                ⚙️ Settings
              </Button>
            </Link>
            <form action="/auth/signout" method="post" className="hidden sm:block">
              <Button variant="outline" size="sm">
                Sign out
              </Button>
            </form>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-in slide-in-from-top">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-3 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                </Link>
              )
            })}
            <div className="pt-2 border-t border-gray-200 space-y-2">
              <Link href="/settings">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-3"
                >
                  <span className="text-xl">⚙️</span>
                  <span>Settings</span>
                </button>
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-all flex items-center gap-3"
                >
                  <span className="text-xl">👋</span>
                  <span>Sign out</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
