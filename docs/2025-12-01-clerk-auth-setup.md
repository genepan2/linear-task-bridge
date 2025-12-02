# Clerk Authentication Setup for Task Bridge

**Date:** 2025-12-01
**Purpose:** Document Clerk authentication configuration with sign-up disabled

## Overview

Task Bridge uses Clerk for authentication with admin-managed user accounts. Clients cannot self-register; only administrators can create accounts via the Clerk Dashboard.

## Files Created

### 1. Authentication Middleware
**File:** `src/middleware.ts`
- Protects all routes except `/sign-in` and webhooks
- Uses `clerkMiddleware` with route matching
- Automatically redirects unauthenticated users to sign-in

### 2. Type Definitions
**File:** `src/types/clerk.ts`
- Defines `UserMetadata` interface with:
  - `allowedProjects: string[]` - Linear project IDs user can access
  - `displayName?: string` - Name shown in Linear comments
  - `linearLabelId?: string` - Client attribution label ID
- Augments Clerk's `UserPrivateMetadata` type
- All metadata stored in `privateMetadata` for security

### 3. Auth Helper Functions
**File:** `src/lib/auth.ts`
- `getUserMetadata()` - Get user's metadata from Clerk
- `validateProjectAccess(projectId)` - Check if user can access a project
- `getCurrentUserDisplayName()` - Get display name for Linear comments
- `getUserLinearLabelId()` - Get client attribution label
- `requireAuth()` - Verify authentication in API routes

### 4. Auth Pages
**File:** `src/app/(auth)/layout.tsx`
- Centered layout for authentication pages
- Gradient background styling

**File:** `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Clerk SignIn component with Task Bridge branding
- Custom styling and appearance configuration
- Hides default Clerk headers to show custom branding

### 5. Protected Layout
**File:** `src/app/(protected)/layout.tsx`
- Wraps all authenticated pages
- Includes Header component
- Redirects to `/sign-in` if not authenticated

### 6. Header Component
**File:** `src/components/layout/Header.tsx`
- Task Bridge logo and branding
- UserButton for profile/logout
- Project switcher placeholder (to be implemented)

## Clerk Dashboard Configuration

### Step 1: Disable Sign-Up

1. Go to Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Navigate to **User & Authentication** → **Email, Phone, Username**
4. **Disable** the following options:
   - ❌ Allow sign-up
   - ❌ Enable email verification (optional, but recommended to keep enabled)
5. Click **Save**

### Step 2: Configure Sign-In Options

1. Under **User & Authentication** → **Email, Phone, Username**
2. Enable **only** sign-in with email/password:
   - ✅ Email address
   - ❌ Phone number
   - ❌ Username
3. Click **Save**

### Step 3: Configure Appearance (Optional)

1. Navigate to **Customization** → **Appearance**
2. Customize to match Task Bridge branding:
   - Primary color: `#2563eb` (blue-600)
   - Brand logo/icon (optional)
3. Click **Save**

### Step 4: Set Environment Variables

Add to `.env.local`:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Linear Integration
LINEAR_API_KEY=lin_api_xxx
LINEAR_CLIENT_LABEL_ID=xxx  # Optional: Generic "client-submitted" label
```

## Creating Client Accounts

### Via Clerk Dashboard

1. Go to **Users** in Clerk Dashboard
2. Click **Create User**
3. Enter user details:
   - Email address
   - Password (or send invitation)
4. Click **Create**

### Setting User Metadata

After creating a user:

1. Click on the user in the dashboard
2. Go to **Metadata** tab
3. Under **Private Metadata**, add JSON:

```json
{
  "allowedProjects": ["PROJECT_ID_1", "PROJECT_ID_2"],
  "displayName": "Acme Corp",
  "linearLabelId": "LABEL_ID_FOR_CLIENT_ACME"
}
```

4. Click **Save**

### Example User Setup

For a client "Acme Corp":

```json
{
  "allowedProjects": ["abc123def456"],
  "displayName": "Acme Corp",
  "linearLabelId": "label_xyz789_client_acme"
}
```

## Security Considerations

1. **Sign-up Disabled**: Users cannot self-register
2. **Private Metadata**: All project access stored in `privateMetadata` (server-only)
3. **Project Validation**: Every API call validates user has access to requested project
4. **Middleware Protection**: All routes protected by default except sign-in
5. **Session Management**: Clerk handles secure session management

## Testing Authentication

### Test User Access

1. Create test user in Clerk Dashboard
2. Set `allowedProjects` to a test project ID
3. Log in at `/sign-in`
4. Verify user can only access assigned projects

### Test Project Restriction

1. Try accessing a project not in user's `allowedProjects`
2. Should receive 403 Forbidden error
3. Check API routes validate access correctly

## Usage in API Routes

```typescript
import { requireAuth } from '@/lib/auth'
import { validateProjectAccess } from '@/lib/auth'

export async function GET(request: Request) {
  // Require authentication
  const { userId } = await requireAuth()

  // Get project ID from request
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')

  if (!projectId) {
    return Response.json({ error: 'Project ID required' }, { status: 400 })
  }

  // Validate project access
  const hasAccess = await validateProjectAccess(projectId)

  if (!hasAccess) {
    return Response.json({ error: 'Access denied' }, { status: 403 })
  }

  // Proceed with Linear API calls...
}
```

## Usage in Components

```typescript
import { useUser } from '@clerk/nextjs'
import { getUserMetadata } from '@/lib/auth'

export default function ProjectList() {
  const { user } = useUser()

  // On server-side
  const metadata = await getUserMetadata()
  const projects = metadata.allowedProjects

  return (
    <div>
      <h1>Welcome, {metadata.displayName || user?.firstName}</h1>
      {/* Render projects */}
    </div>
  )
}
```

## Troubleshooting

### Users Can Still Sign Up

- Verify sign-up is disabled in Clerk Dashboard
- Check no custom OAuth providers are enabled
- Clear browser cache and test in incognito

### Metadata Not Loading

- Ensure metadata is in `privateMetadata` not `publicMetadata`
- Verify structure matches `UserMetadata` interface
- Check server-side code uses `currentUser()` from `@clerk/nextjs/server`

### Authentication Loop

- Verify `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` is set
- Check middleware matcher config is correct
- Ensure `/sign-in` route exists and is public

## Next Steps

1. ✅ Clerk authentication configured
2. ⏭️ Implement Linear API integration
3. ⏭️ Create project switcher component
4. ⏭️ Build issue list and detail pages
5. ⏭️ Add comment functionality

## Related Files

- Authentication: `src/middleware.ts`, `src/lib/auth.ts`
- Types: `src/types/clerk.ts`
- Layouts: `src/app/(auth)/layout.tsx`, `src/app/(protected)/layout.tsx`
- Components: `src/components/layout/Header.tsx`
- Sign-in: `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
