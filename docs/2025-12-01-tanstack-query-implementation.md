# TanStack Query Implementation Summary

## Overview
Implemented TanStack Query (React Query) for data fetching with optimistic updates and caching.

## Files Created

### 1. `/src/lib/query-client.ts`
QueryClient configuration with defaults:
- `staleTime: 30000` (30 seconds)
- `retry: 1`
- `refetchOnWindowFocus: true`

**Functions:**
- `makeQueryClient()` - Creates new QueryClient instance
- `getQueryClient()` - Returns singleton client (browser) or new instance (server)

---

### 2. `/src/components/providers/QueryProvider.tsx`
Client-side QueryClientProvider wrapper with React Query DevTools.

**Props:**
```typescript
interface QueryProviderProps {
  children: ReactNode;
}
```

---

### 3. `/src/lib/api-client.ts`
Type-safe API client with fetch wrapper.

**Main Types:**
```typescript
export interface ProjectsResponse {
  projects: Array<{
    id: string;
    name: string;
    key: string;
    description?: string;
    icon?: string;
    color?: string;
  }>;
}

export interface IssuesResponse {
  issues: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
    assigneeId?: string;
    labels?: string[];
  }>;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface IssueResponse {
  issue: IssueObject;
}

export interface CommentsResponse {
  comments: Array<{
    id: string;
    body: string;
    authorId: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface CommentResponse {
  comment: CommentObject;
}

export interface CreateIssueData {
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId: string;
  assigneeId?: string;
  labels?: string[];
}

export interface CreateCommentData {
  body: string;
}

export interface IssueFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
}
```

**API Client:**
```typescript
export const api = {
  projects: {
    list: () => Promise<ProjectsResponse>
  },
  issues: {
    list: (projectId, filters?) => Promise<IssuesResponse>
    get: (issueId) => Promise<IssueResponse>
    create: (data) => Promise<IssueResponse>
    update: (issueId, data) => Promise<IssueResponse>
    delete: (issueId) => Promise<void>
  },
  comments: {
    list: (issueId) => Promise<CommentsResponse>
    create: (issueId, body) => Promise<CommentResponse>
    delete: (issueId, commentId) => Promise<void>
  }
}
```

---

### 4. `/src/hooks/useProjects.ts`

#### `useProjects()`
Fetch all projects.

**Return Type:**
```typescript
UseQueryResult<ProjectsResponse, Error> & {
  data?: ProjectsResponse;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
```

#### `useCurrentProject()`
Get the first/default project.

**Return Type:**
```typescript
{
  data?: Project; // Single project object
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
```

---

### 5. `/src/hooks/useIssues.ts`

#### `useIssues(projectId: string, filters?: IssueFilters)`
Fetch issues for a project with optional filters.

**Return Type:**
```typescript
UseQueryResult<IssuesResponse, Error> & {
  data?: IssuesResponse;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
```

#### `useIssue(issueId: string)`
Fetch a single issue by ID.

**Return Type:**
```typescript
UseQueryResult<IssueResponse, Error> & {
  data?: IssueResponse;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
```

#### `useCreateIssue()`
Create new issue with optimistic updates.

**Return Type:**
```typescript
UseMutationResult<IssueResponse, Error, CreateIssueData> & {
  mutate: (data: CreateIssueData) => void;
  mutateAsync: (data: CreateIssueData) => Promise<IssueResponse>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data?: IssueResponse;
  reset: () => void;
}
```

**Features:**
- Optimistic update: adds issue to list immediately
- Rollback on error
- Temp ID replaced with real ID on success

#### `useUpdateIssue()`
Update existing issue.

**Return Type:**
```typescript
UseMutationResult<
  IssueResponse,
  Error,
  { issueId: string; data: Partial<CreateIssueData> }
> & {
  mutate: (vars: { issueId: string; data: Partial<CreateIssueData> }) => void;
  mutateAsync: (vars) => Promise<IssueResponse>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
}
```

#### `useDeleteIssue()`
Delete an issue.

**Return Type:**
```typescript
UseMutationResult<void, Error, string> & {
  mutate: (issueId: string) => void;
  mutateAsync: (issueId: string) => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
}
```

---

### 6. `/src/hooks/useComments.ts`

#### `useComments(issueId: string)`
Fetch all comments for an issue.

**Return Type:**
```typescript
UseQueryResult<CommentsResponse, Error> & {
  data?: CommentsResponse;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}
```

#### `useCreateComment(issueId: string)`
Create new comment with optimistic updates.

**Return Type:**
```typescript
UseMutationResult<CommentResponse, Error, CreateCommentData> & {
  mutate: (data: CreateCommentData) => void;
  mutateAsync: (data: CreateCommentData) => Promise<CommentResponse>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
  data?: CommentResponse;
  reset: () => void;
}
```

**Features:**
- Optimistic update: shows comment immediately
- Rollback on error
- Temp ID replaced with real ID on success

#### `useDeleteComment(issueId: string)`
Delete a comment.

**Return Type:**
```typescript
UseMutationResult<void, Error, string> & {
  mutate: (commentId: string) => void;
  mutateAsync: (commentId: string) => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: Error | null;
}
```

---

## Optimistic Updates Implemented

### Creating Issues
1. Temporary issue added to list immediately with `temp-${Date.now()}` ID
2. User sees instant feedback
3. On success: temp ID replaced with real ID from server
4. On error: issue removed from list (rollback)

### Creating Comments
1. Temporary comment added to end of list immediately
2. Shows with temp ID and current timestamp
3. On success: temp comment replaced with real data
4. On error: comment removed from list (rollback)

---

## Usage Examples

### Basic Query
```typescript
'use client';
import { useProjects } from '@/hooks/useProjects';

export function ProjectsList() {
  const { data, isLoading, isError, error } = useProjects();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.projects.map(project => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  );
}
```

### Filtered Issues
```typescript
const { data } = useIssues('project-123', {
  status: 'in_progress',
  priority: 'high',
  search: 'bug'
});
```

### Creating Issue with Optimistic Update
```typescript
const createIssue = useCreateIssue();

const handleSubmit = async (formData: CreateIssueData) => {
  try {
    await createIssue.mutateAsync(formData);
    // Issue appears immediately in list
    toast.success('Issue created');
  } catch (error) {
    // Issue removed from list on error
    toast.error('Failed to create issue');
  }
};
```

### Creating Comment
```typescript
const createComment = useCreateComment('issue-123');

const handleComment = async (body: string) => {
  createComment.mutate(
    { body },
    {
      onSuccess: () => toast.success('Comment added'),
      onError: () => toast.error('Failed to add comment'),
    }
  );
};
```

---

## App Layout Updated

`/src/app/layout.tsx` now includes `<QueryProvider>` wrapping all children.

---

## Configuration Summary

- **Stale Time:** 30 seconds (prevents excessive refetches)
- **Retry:** 1 attempt (queries), 0 attempts (mutations)
- **Refetch on Focus:** Enabled (keeps data fresh)
- **DevTools:** Enabled in development only

---

## Next Steps

Wait for API routes to be created at:
- `GET /api/projects`
- `GET /api/issues?projectId=...`
- `GET /api/issues/:id`
- `POST /api/issues`
- `PATCH /api/issues/:id`
- `DELETE /api/issues/:id`
- `GET /api/issues/:issueId/comments`
- `POST /api/issues/:issueId/comments`
- `DELETE /api/issues/:issueId/comments/:commentId`

Once API routes exist, all hooks will work automatically with full type safety.
