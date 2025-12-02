'use client'

import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { ProjectSwitcher } from '@/components/layout/ProjectSwitcher'

export default function Header() {
  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">TB</span>
              </div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                Task Bridge
              </span>
            </Link>
          </div>

          {/* Navigation and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Project Switcher - Auto-hidden if single project (PROJECT-3) */}
            <div className="hidden sm:block">
              <ProjectSwitcher />
            </div>

            {/* User Button */}
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9',
                  userButtonPopoverCard: 'shadow-xl',
                },
              }}
              afterSignOutUrl="/sign-in"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
