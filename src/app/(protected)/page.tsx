/**
 * Protected Root Page - Redirects based on user's project count
 */
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

// Force dynamic rendering - this page requires auth
export const dynamic = 'force-dynamic';

async function getUserProjects(userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/projects`,
    {
      headers: {
        'x-user-id': userId,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
}

export default async function ProtectedRootPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const { projects } = await getUserProjects(userId);

    if (!projects || projects.length === 0) {
      // No projects - show onboarding or error page
      redirect('/no-access');
    } else if (projects.length === 1) {
      // Single project - go directly to issues
      redirect('/issues');
    } else {
      // Multiple projects - show project selector
      redirect('/projects');
    }
  } catch (error) {
    // On error, redirect to issues page which will handle the error
    redirect('/issues');
  }
}
