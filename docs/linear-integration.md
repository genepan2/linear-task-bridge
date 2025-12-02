# Linear SDK Integration Documentation

## Overview

This document provides a comprehensive guide to the Linear SDK integration for Task Bridge. The integration provides a server-side singleton client with typed interfaces for all Linear API operations.

## Architecture

### File Structure

```
src/
├── lib/
│   ├── linear.ts           # Main Linear client and API functions
│   ├── linear-helpers.ts   # Utility functions for formatting/transforming
│   └── linear-errors.ts    # Custom error classes and error handling
└── types/
    └── linear.ts          # TypeScript type definitions
```

## Core Components

### 1. Linear Client (`src/lib/linear.ts`)

The main Linear client module provides a singleton pattern for the Linear SDK client and core API functions.

#### Key Exports

##### Client Initialization

```typescript
getLinearClient(): LinearClient
```
Returns the singleton Linear client instance. Automatically initializes on first call using `LINEAR_API_KEY` environment variable.

**Throws:** `Error` if `LINEAR_API_KEY` is not set

##### Project Operations

```typescript
getProject(projectId: string): Promise<LinearProject>
```
Fetches a Linear project by ID with full details including team, lead, and issue counts.

**Parameters:**
- `projectId` - Linear project UUID

**Returns:** `LinearProject` with complete project details

**Throws:** `LinearAPIError` if project not found or API error

```typescript
getProjectIssues(projectId: string, filters?: IssueFilters): Promise<LinearIssue[]>
```
Fetches all issues for a project with optional filtering and sorting.

**Parameters:**
- `projectId` - Linear project UUID
- `filters` (optional):
  - `status` - Filter by status name
  - `search` - Search in title/description
  - `sortBy` - Sort field (`'createdAt'`, `'updatedAt'`, `'priority'`)
  - `sortOrder` - Sort direction (`'asc'`, `'desc'`)
  - `assigneeId` - Filter by assignee
  - `labelIds` - Filter by labels

**Returns:** Array of `LinearIssue` objects

**Example:**
```typescript
const issues = await getProjectIssues('proj_123', {
  status: 'In Progress',
  sortBy: 'priority',
  sortOrder: 'asc'
});
```

##### Issue Operations

```typescript
getIssue(issueId: string): Promise<LinearIssue>
```
Fetches a single issue by ID with full details.

**Parameters:**
- `issueId` - Linear issue UUID

**Returns:** `LinearIssue` with complete issue details

```typescript
createIssue(data: CreateIssueInput): Promise<LinearIssue>
```
Creates a new issue in Linear.

**Parameters:**
- `data.projectId` - Project UUID (required)
- `data.title` - Issue title (required)
- `data.description` - Issue description in markdown (required)
- `data.priority` - Priority level 0-4 (optional, default: 0)
- `data.labelIds` - Array of label UUIDs (optional)
- `data.assigneeId` - Assignee user UUID (optional)
- `data.stateId` - Workflow state UUID (optional)

**Returns:** Created `LinearIssue`

**Example:**
```typescript
const issue = await createIssue({
  projectId: 'proj_123',
  title: 'Implement new feature',
  description: '## Description\n\nDetailed feature description...',
  priority: 2, // High
  labelIds: ['label_1', 'label_2']
});
```

##### Comment Operations

```typescript
getIssueComments(issueId: string): Promise<LinearComment[]>
```
Fetches all comments for an issue.

**Parameters:**
- `issueId` - Linear issue UUID

**Returns:** Array of `LinearComment` objects

```typescript
createComment(issueId: string, body: string, clientName: string): Promise<LinearComment>
```
Creates a comment on an issue with attribution.

**Parameters:**
- `issueId` - Linear issue UUID
- `body` - Comment body in markdown
- `clientName` - Name of client app (automatically appended to comment)

**Returns:** Created `LinearComment`

**Example:**
```typescript
const comment = await createComment(
  'issue_123',
  'Updated the implementation as discussed.',
  'Task Bridge'
);
// Comment will include "Posted via Task Bridge" attribution
```

##### Team Operations

```typescript
getTeamIdForProject(projectId: string): Promise<string>
```
Gets the team ID for a project (used internally for issue creation).

```typescript
getTeamWorkflowStates(teamId: string): Promise<LinearWorkflowState[]>
```
Fetches all workflow states for a team.

**Returns:** Array of workflow states sorted by position

---

### 2. Type Definitions (`src/types/linear.ts`)

Comprehensive TypeScript interfaces for all Linear entities.

#### Core Types

##### `IssueFilters`
Filters for querying issues:
```typescript
interface IssueFilters {
  status?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
  assigneeId?: string;
  labelIds?: string[];
}
```

##### `CreateIssueInput`
Input for creating issues:
```typescript
interface CreateIssueInput {
  projectId: string;
  title: string;
  description: string;
  priority?: number;      // 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low
  labelIds?: string[];
  assigneeId?: string;
  stateId?: string;
}
```

##### `LinearIssue`
Complete issue details:
```typescript
interface LinearIssue {
  id: string;
  identifier: string;     // e.g., "PROJ-123"
  title: string;
  description: string | null;
  state: {
    id: string;
    name: string;
    type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
    color: string;
  };
  priority: number;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  labels: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  project?: {
    id: string;
    name: string;
    icon?: string;
  };
  team: {
    id: string;
    name: string;
    key: string;
  };
  createdAt: string;
  updatedAt: string;
  url: string;
}
```

##### Other Types
- `LinearComment` - Issue comment details
- `LinearProject` - Project details with metrics
- `LinearTeam` - Team information
- `LinearWorkflowState` - Workflow state configuration
- `LinearLabel` - Label details
- `LinearError` - API error response
- `PaginatedResponse<T>` - Paginated result wrapper

---

### 3. Helper Utilities (`src/lib/linear-helpers.ts`)

Utility functions for formatting and transforming Linear data.

#### Priority Helpers

```typescript
getPriorityLabel(priority: number): string
```
Returns label: "None", "Urgent", "High", "Medium", or "Low"

```typescript
getPriorityColor(priority: number): string
```
Returns hex color code for priority level

```typescript
getPriorityIcon(priority: number): string
```
Returns emoji icon: ○, 🔴, 🟠, 🟡, or 🟢

**Priority Mapping:**
- `0` - None (Gray, ○)
- `1` - Urgent (Red, 🔴)
- `2` - High (Orange, 🟠)
- `3` - Medium (Blue, 🟡)
- `4` - Low (Gray, 🟢)

#### State Helpers

```typescript
getStateTypeLabel(stateType: string): string
```
Returns display label: "Backlog", "To Do", "In Progress", "Done", or "Canceled"

```typescript
getStateTypeColor(stateType: string): string
```
Returns hex color for state type

```typescript
getStateCategory(stateType: string): 'inactive' | 'active' | 'complete'
```
Returns state category for grouping

#### Issue Status Checks

```typescript
isIssueCompleted(issue: LinearIssue): boolean
isIssueCanceled(issue: LinearIssue): boolean
isIssueActive(issue: LinearIssue): boolean
isIssueInactive(issue: LinearIssue): boolean
```

#### Formatting Helpers

```typescript
formatIssueIdentifierWithPriority(issue: LinearIssue): string
```
Returns formatted identifier: "🔴 PROJ-123"

```typescript
getRelativeTime(isoDate: string): string
```
Returns relative time: "2 days ago", "3 hours ago", etc.

```typescript
formatDate(isoDate: string): string
```
Returns formatted date: "Jan 15, 2025"

```typescript
formatDateTime(isoDate: string): string
```
Returns formatted date and time: "Jan 15, 2025 at 3:45 PM"

#### Color Utilities

```typescript
lightenColor(color: string, percent: number): string
darkenColor(color: string, percent: number): string
getContrastTextColor(backgroundColor: string): string
```

#### Data Transformation

```typescript
parseIssueIdentifier(identifier: string): { teamKey: string; issueNumber: number } | null
```
Parses "PROJ-123" into `{ teamKey: "PROJ", issueNumber: 123 }`

```typescript
sortIssuesByPriority(issues: LinearIssue[]): LinearIssue[]
```
Sorts issues by priority (urgent first)

```typescript
groupIssuesByState(issues: LinearIssue[]): Map<string, LinearIssue[]>
```
Groups issues by state name

```typescript
groupIssuesByAssignee(issues: LinearIssue[]): Map<string, LinearIssue[]>
```
Groups issues by assignee (unassigned grouped as "Unassigned")

```typescript
searchIssues(issues: LinearIssue[], query: string): LinearIssue[]
```
Filters issues by search query in title/description/identifier

---

### 4. Error Handling (`src/lib/linear-errors.ts`)

Custom error classes and error handling utilities.

#### Error Classes

##### `LinearAPIError`
Base error class for all Linear API errors.

**Properties:**
- `message` - Error message
- `code` - Error code
- `status` - HTTP status code
- `details` - Additional error details

##### Specialized Error Classes

All extend `LinearAPIError`:

- `LinearAuthenticationError` - Authentication failure (401)
- `LinearNotFoundError` - Resource not found (404)
- `LinearRateLimitError` - Rate limit exceeded (429)
- `LinearValidationError` - Validation failure (400)
- `LinearPermissionError` - Permission denied (403)
- `LinearNetworkError` - Network/connection error

#### Error Handling Functions

```typescript
handleLinearError(error: unknown, context?: string): LinearAPIError
```
Parses and transforms raw errors into typed `LinearAPIError` instances.

**Example:**
```typescript
try {
  const issue = await getIssue(issueId);
} catch (error) {
  const linearError = handleLinearError(error, 'Failed to fetch issue');
  console.error(linearError.message);
}
```

#### Error Type Guards

```typescript
isLinearAPIError(error: unknown): error is LinearAPIError
isLinearAuthenticationError(error: unknown): error is LinearAuthenticationError
isLinearNotFoundError(error: unknown): error is LinearNotFoundError
isLinearRateLimitError(error: unknown): error is LinearRateLimitError
isLinearValidationError(error: unknown): error is LinearValidationError
isLinearPermissionError(error: unknown): error is LinearPermissionError
isLinearNetworkError(error: unknown): error is LinearNetworkError
```

**Example:**
```typescript
try {
  await createIssue(data);
} catch (error) {
  if (isLinearAuthenticationError(error)) {
    console.error('Invalid API key');
  } else if (isLinearValidationError(error)) {
    console.error('Invalid input:', error.validationErrors);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

```typescript
formatErrorForUser(error: unknown): string
```
Converts errors to user-friendly messages.

**Example:**
```typescript
try {
  await operation();
} catch (error) {
  const message = formatErrorForUser(error);
  toast.error(message); // Show to user
}
```

---

## Usage Examples

### Server Component (Next.js App Router)

```typescript
// app/projects/[projectId]/page.tsx
import { getProject, getProjectIssues } from '@/lib/linear';
import { groupIssuesByState, formatIssueIdentifierWithPriority } from '@/lib/linear-helpers';

export default async function ProjectPage({ params }: { params: { projectId: string } }) {
  const project = await getProject(params.projectId);
  const issues = await getProjectIssues(params.projectId, {
    sortBy: 'priority',
    sortOrder: 'asc'
  });

  const groupedIssues = groupIssuesByState(issues);

  return (
    <div>
      <h1>{project.name}</h1>
      {Array.from(groupedIssues.entries()).map(([stateName, stateIssues]) => (
        <div key={stateName}>
          <h2>{stateName}</h2>
          <ul>
            {stateIssues.map(issue => (
              <li key={issue.id}>
                {formatIssueIdentifierWithPriority(issue)} {issue.title}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### API Route

```typescript
// app/api/issues/route.ts
import { NextResponse } from 'next/server';
import { createIssue } from '@/lib/linear';
import { handleLinearError, formatErrorForUser } from '@/lib/linear-errors';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const issue = await createIssue({
      projectId: body.projectId,
      title: body.title,
      description: body.description,
      priority: body.priority,
      labelIds: body.labelIds,
    });

    return NextResponse.json({ success: true, issue });
  } catch (error) {
    const linearError = handleLinearError(error, 'Failed to create issue');
    return NextResponse.json(
      { success: false, error: formatErrorForUser(linearError) },
      { status: linearError.status ?? 500 }
    );
  }
}
```

### Server Action

```typescript
// app/actions/issues.ts
'use server';

import { createComment } from '@/lib/linear';
import { revalidatePath } from 'next/cache';

export async function addComment(issueId: string, body: string) {
  try {
    const comment = await createComment(issueId, body, 'Task Bridge');
    revalidatePath(`/issues/${issueId}`);
    return { success: true, comment };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
```

---

## Environment Setup

### 1. Get Linear API Key

1. Go to [Linear Settings → API](https://linear.app/settings/api)
2. Create a new personal API key
3. Copy the key (starts with `lin_api_`)

### 2. Configure Environment

Create `.env.local`:

```bash
LINEAR_API_KEY=lin_api_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. Install Dependencies

```bash
npm install @linear/sdk
```

---

## Security Considerations

1. **Server-Side Only**: The Linear client and all API operations run server-side only. Never expose the API key to the client.

2. **Environment Variables**: Store the API key in `.env.local` (not committed to git).

3. **Error Messages**: Use `formatErrorForUser()` to sanitize error messages before showing to users.

4. **Rate Limiting**: Linear has rate limits. Handle `LinearRateLimitError` and implement retry logic if needed.

---

## Best Practices

1. **Use Type Guards**: Always check error types with type guard functions.

2. **Add Context**: Use the `context` parameter in `handleLinearError()` for better debugging.

3. **Cache Data**: Consider caching frequently accessed data to reduce API calls.

4. **Revalidation**: Use Next.js revalidation after mutations:
   ```typescript
   revalidatePath('/projects/[id]');
   ```

5. **Loading States**: Wrap async operations in Suspense boundaries or loading states.

---

## API Reference Summary

### Exports from `src/lib/linear.ts`
- `getLinearClient()`
- `getProject(projectId)`
- `getProjectIssues(projectId, filters?)`
- `getIssue(issueId)`
- `getIssueComments(issueId)`
- `createIssue(data)`
- `createComment(issueId, body, clientName)`
- `getTeamIdForProject(projectId)`
- `getTeamWorkflowStates(teamId)`

### Exports from `src/lib/linear-helpers.ts`
- Priority: `getPriorityLabel()`, `getPriorityColor()`, `getPriorityIcon()`
- State: `getStateTypeLabel()`, `getStateTypeColor()`, `getStateCategory()`
- Status: `isIssueCompleted()`, `isIssueCanceled()`, `isIssueActive()`, `isIssueInactive()`
- Formatting: `formatIssueIdentifierWithPriority()`, `getRelativeTime()`, `formatDate()`, `formatDateTime()`
- Colors: `lightenColor()`, `darkenColor()`, `getContrastTextColor()`
- Transform: `parseIssueIdentifier()`, `sortIssuesByPriority()`, `groupIssuesByState()`, `groupIssuesByAssignee()`, `searchIssues()`

### Exports from `src/lib/linear-errors.ts`
- Classes: `LinearAPIError`, `LinearAuthenticationError`, `LinearNotFoundError`, `LinearRateLimitError`, `LinearValidationError`, `LinearPermissionError`, `LinearNetworkError`
- Functions: `handleLinearError()`, `formatErrorForUser()`
- Type Guards: `isLinearAPIError()`, `isLinearAuthenticationError()`, `isLinearNotFoundError()`, `isLinearRateLimitError()`, `isLinearValidationError()`, `isLinearPermissionError()`, `isLinearNetworkError()`

### Exports from `src/types/linear.ts`
- `IssueFilters`, `CreateIssueInput`, `LinearIssue`, `LinearComment`, `LinearProject`, `LinearTeam`, `LinearWorkflowState`, `LinearLabel`, `LinearError`, `PaginatedResponse<T>`

---

## Testing

Example test structure (using Jest/Vitest):

```typescript
// __tests__/lib/linear.test.ts
import { getProject, getProjectIssues } from '@/lib/linear';
import { LinearNotFoundError } from '@/lib/linear-errors';

describe('Linear Integration', () => {
  it('should fetch project details', async () => {
    const project = await getProject('valid-project-id');
    expect(project.name).toBeDefined();
  });

  it('should throw error for invalid project', async () => {
    await expect(getProject('invalid-id')).rejects.toThrow(LinearNotFoundError);
  });

  it('should filter issues by status', async () => {
    const issues = await getProjectIssues('project-id', {
      status: 'In Progress'
    });
    expect(issues.every(i => i.state.name === 'In Progress')).toBe(true);
  });
});
```

---

## Troubleshooting

### "LINEAR_API_KEY environment variable is not set"
- Ensure `.env.local` exists with valid API key
- Restart your Next.js dev server after adding the key

### "Authentication failed"
- Verify API key is correct and not expired
- Check API key has necessary permissions in Linear

### "Rate limit exceeded"
- Implement exponential backoff retry logic
- Cache frequently accessed data
- Reduce concurrent API calls

### "Resource not found"
- Verify project/issue IDs are correct
- Ensure API key has access to the workspace/team

---

## Support & Resources

- [Linear API Documentation](https://developers.linear.app/)
- [Linear SDK GitHub](https://github.com/linear/linear)
- [GraphQL Explorer](https://studio.apollographql.com/public/Linear-API/variant/current/home)
