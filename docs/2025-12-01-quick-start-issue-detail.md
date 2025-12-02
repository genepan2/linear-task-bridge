# Quick Start: Issue Detail Page

## Installation

```bash
# Install dependencies
npm install

# or
yarn install
```

## Environment Variables

Create a `.env.local` file:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in

# Linear
LINEAR_API_KEY=lin_api_xxx

# Optional: Default label ID for client-submitted issues
LINEAR_CLIENT_LABEL_ID=xxx
```

## Development

```bash
# Run development server
npm run dev

# Open browser
# Navigate to: http://localhost:3000/issues/[issue-id]
```

## File Structure Quick Reference

### Pages
- `/issues/[id]` → `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/app/(protected)/issues/[id]/page.tsx`

### Components
- **IssueDetailClient**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/components/issues/IssueDetailClient.tsx`
- **IssueMetadataSidebar**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/components/issues/IssueMetadataSidebar.tsx`
- **CommentThread**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/components/issues/CommentThread.tsx`
- **CommentInput**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/components/issues/CommentInput.tsx`

### Hooks
- **useIssue**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/hooks/useIssue.ts`
- **useComments**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/hooks/useComments.ts`
- **useCreateComment**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/hooks/useCreateComment.ts`

### Utilities
- **Markdown**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/lib/markdown.ts`
- **Utils**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/lib/utils.ts`

### Types
- **Index**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/types/index.ts`
- **Linear**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/types/linear.ts`
- **API**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/types/api.ts`
- **Clerk**: `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/src/types/clerk.ts`

## Usage Example

### 1. Basic Usage

```typescript
// In your app
import { IssueDetailClient } from '@/components/issues/IssueDetailClient';

export default function IssuePage({ params }: { params: { id: string } }) {
  return <IssueDetailClient issueId={params.id} />;
}
```

### 2. Using Hooks Directly

```typescript
'use client';

import { useIssue } from '@/hooks/useIssue';
import { useComments } from '@/hooks/useComments';
import { useCreateComment } from '@/hooks/useCreateComment';

function MyComponent({ issueId }: { issueId: string }) {
  const { data: issue, isLoading } = useIssue(issueId);
  const { data: comments = [] } = useComments(issueId);
  const createComment = useCreateComment();

  const handleComment = async (body: string) => {
    await createComment.mutateAsync({ issueId, body });
  };

  // ... render logic
}
```

### 3. Customizing Markdown

```typescript
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '@/lib/markdown';

function CustomMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={markdownComponents}
    >
      {content}
    </ReactMarkdown>
  );
}
```

## API Routes Needed

Create these API routes for the components to work:

### 1. Get Issue Detail

**File**: `src/app/api/issues/[id]/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // TODO: Fetch issue from Linear API
  // TODO: Verify user has access to this issue's project

  return NextResponse.json({
    id: params.id,
    identifier: 'PRJ-123',
    title: 'Example Issue',
    description: 'Issue description...',
    // ... other fields
  });
}
```

### 2. Get Comments

**File**: `src/app/api/issues/[id]/comments/route.ts`

```typescript
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // TODO: Fetch comments from Linear API
  return NextResponse.json({
    comments: [
      {
        id: '1',
        body: 'Comment text...',
        user: { id: '1', name: 'User', email: 'user@example.com' },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]
  });
}
```

### 3. Create Comment

```typescript
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { body } = await request.json();

  // TODO: Create comment via Linear API
  // TODO: Prepend client identifier to comment

  return NextResponse.json({
    id: 'new-comment-id',
    body,
    user: { /* current user */ },
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
```

## Testing

### Test Issue Detail Page

```typescript
// test/components/IssueDetailClient.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IssueDetailClient } from '@/components/issues/IssueDetailClient';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe('IssueDetailClient', () => {
  it('renders issue details', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <IssueDetailClient issueId="test-id" />
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Loading/i)).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Issue not loading

1. Check API route exists: `/api/issues/[id]`
2. Check console for errors
3. Verify React Query DevTools (add to development)

### Comments not posting

1. Check API route: `/api/issues/[id]/comments`
2. Verify request body format
3. Check network tab for errors

### Markdown not rendering

1. Verify `react-markdown` is installed
2. Check `markdownComponents` import
3. Ensure `remarkGfm` plugin is loaded

## Performance Tips

1. **Prefetch Issues**: Use `queryClient.prefetchQuery()` on issue list
2. **Optimize Images**: Use Next.js Image component for avatars
3. **Lazy Load**: Consider lazy loading comment thread for long threads
4. **Pagination**: Implement comment pagination for many comments

## Customization

### Change Stale Time

```typescript
// src/hooks/useIssue.ts
staleTime: 60000, // 60 seconds instead of 30
```

### Custom Priority Icons

```typescript
// src/components/issues/IssueMetadataSidebar.tsx
const PriorityIcon = ({ priority }: { priority: number }) => {
  // Add your custom icons
  return <YourCustomIcon />;
};
```

### Custom Markdown Components

```typescript
// src/lib/markdown.ts
export const markdownComponents = {
  // Override or add new components
  img: ({ node, ...props }) => (
    <Image {...props} width={800} height={600} />
  ),
};
```

## Next Steps

1. ✅ Issue Detail Page created
2. ⏳ Create API routes
3. ⏳ Add authentication middleware
4. ⏳ Add authorization checks
5. ⏳ Add tests
6. ⏳ Add error boundaries
7. ⏳ Add toast notifications

## Support

See full documentation in:
- `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/docs/2025-12-01-implementation-issue-detail-page.md`
- `/Users/eugenpanov/Code/eugenius-tools/linear-task-bridge/docs/prd.md`
