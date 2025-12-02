import { auth, currentUser } from '@clerk/nextjs/server'
import type { UserMetadata } from '@/types'

/**
 * Get the current user's metadata from Clerk
 * @returns UserMetadata object with allowedProjects, displayName, and linearLabelId
 * @throws Error if user is not authenticated
 */
export async function getUserMetadata(): Promise<UserMetadata> {
  const user = await currentUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  // Extract metadata from Clerk's privateMetadata
  const metadata = user.privateMetadata as Partial<UserMetadata>

  return {
    allowedProjects: metadata.allowedProjects || [],
    displayName: metadata.displayName,
    linearLabelId: metadata.linearLabelId,
  }
}

/**
 * Validate if the current user has access to a specific project
 * @param projectId - Linear project ID to validate access for
 * @returns true if user has access, false otherwise
 */
export async function validateProjectAccess(projectId: string): Promise<boolean> {
  try {
    const metadata = await getUserMetadata()
    return metadata.allowedProjects.includes(projectId)
  } catch {
    return false
  }
}

/**
 * Get the current user's display name for use in Linear comments
 * Falls back to email or "Task Bridge Client" if no display name is set
 * @returns Display name string
 */
export async function getCurrentUserDisplayName(): Promise<string> {
  const user = await currentUser()

  if (!user) {
    return 'Task Bridge Client'
  }

  const metadata = user.privateMetadata as Partial<UserMetadata>

  return (
    metadata.displayName ||
    user.firstName ||
    user.emailAddresses[0]?.emailAddress ||
    'Task Bridge Client'
  )
}

/**
 * Get the current user's Linear label ID for client attribution
 * @returns Label ID if set, undefined otherwise
 */
export async function getUserLinearLabelId(): Promise<string | undefined> {
  try {
    const metadata = await getUserMetadata()
    return metadata.linearLabelId
  } catch {
    return undefined
  }
}

/**
 * Require authentication for API routes
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<{ userId: string }> {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  return { userId }
}
