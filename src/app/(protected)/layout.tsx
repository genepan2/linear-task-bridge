/**
 * Protected Layout - Wraps all authenticated routes
 */
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Suspense, type ReactNode } from 'react'
import Header from '@/components/layout/Header'
import { ProjectProvider } from '@/lib/project-context'

/**
 * Loading component for Suspense fallback
 */
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto"></div>
      </div>
    </div>
  )
}

// Force dynamic rendering - this layout requires auth at runtime
export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <ProjectProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<LoadingFallback />}>
            {children}
          </Suspense>
        </main>
      </div>
    </ProjectProvider>
  )
}
