# Product Requirements Document: Task Bridge

**Repository:** `linear-task-bridge`
**Client-facing name:** Task Bridge

## Overview

A lightweight web application that allows external clients to interact with specific Linear projects without needing direct Linear access. Clients can view issues, track status, post comments, and submit new issues/bugs through a custom interface.

### Problem Statement

Currently, sharing project progress with clients requires either:
- Giving them full Linear access (security/noise concerns)
- Manual status updates via email/calls (time-consuming)
- Third-party tools that don't integrate well

### Solution

A self-hosted portal where clients log in with provided credentials and interact only with their assigned project(s), with all data flowing directly to/from Linear.

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | Next.js 14+ (App Router) | Full-stack React framework |
| Hosting | Vercel | Serverless deployment |
| Authentication | Clerk | User management, session handling |
| UI | shadcn/ui + Tailwind CSS | Component library + styling |
| Linear Integration | @linear/sdk | Official Linear API client |
| Data Fetching | TanStack Query (React Query) | Caching, background refetching |

### Why No Database?

- Linear is the source of truth for all issue data
- User → Project mapping stored in Clerk user metadata
- No need for a separate database layer

---

## User Roles

### Admin (Portal Owner)
- Creates client accounts via Clerk dashboard
- Assigns project access via Clerk user metadata
- Manages Linear API key configuration
- Does NOT interact with the portal UI (uses Linear directly)

### Client (End User)
- Logs in with provided credentials
- Views issues in assigned project(s)
- Creates new issues
- Posts comments on existing issues
- Cannot sign up independently
- Cannot access projects not assigned to them

---

## Features & User Stories

### Authentication

| ID | Story | Priority |
|----|-------|----------|
| AUTH-1 | As a client, I can log in with my email and password | Must Have |
| AUTH-2 | As a client, I can reset my password if forgotten | Must Have |
| AUTH-3 | As a client, I am redirected to login if I access the app unauthenticated | Must Have |
| AUTH-4 | As an admin, sign-up is disabled — only I can create accounts | Must Have |

### Issue List

| ID | Story | Priority |
|----|-------|----------|
| LIST-1 | As a client, I can see all issues in my assigned project(s) | Must Have |
| LIST-2 | As a client, I can see issue title, status, priority, and assignee | Must Have |
| LIST-3 | As a client, I can filter issues by status (backlog, in progress, done, etc.) | Should Have |
| LIST-4 | As a client, I can search issues by title/description | Should Have |
| LIST-5 | As a client, I can sort issues by created date, updated date, or priority | Nice to Have |
| LIST-6 | As a client, the list updates without full page refresh | Should Have |

### Issue Detail

| ID | Story | Priority |
|----|-------|----------|
| DETAIL-1 | As a client, I can click an issue to see full details | Must Have |
| DETAIL-2 | As a client, I can see the issue description (rendered markdown) | Must Have |
| DETAIL-3 | As a client, I can see all comments on an issue | Must Have |
| DETAIL-4 | As a client, I can see issue metadata (status, priority, labels, assignee) | Must Have |
| DETAIL-5 | As a client, I can see attachments on an issue | Nice to Have |

### Comments

| ID | Story | Priority |
|----|-------|----------|
| COMMENT-1 | As a client, I can post a comment on an issue | Must Have |
| COMMENT-2 | As a client, I can see who posted each comment and when | Must Have |
| COMMENT-3 | As a client, my comments are attributed to a "[Task Bridge]" user or similar identifier in Linear | Must Have |

### Issue Creation

| ID | Story | Priority |
|----|-------|----------|
| CREATE-1 | As a client, I can create a new issue | Must Have |
| CREATE-2 | As a client, I must fill in required fields (title, description) | Must Have |
| CREATE-3 | As a client, I can select issue type (bug, feature request, task) via labels | Should Have |
| CREATE-4 | As a client, I can set priority level | Should Have |
| CREATE-5 | As a client, I can attach files/screenshots | Nice to Have |
| CREATE-6 | As a client, all issues I create are tagged with a "client-submitted" label | Must Have |

### Multi-Project Support

| ID | Story | Priority |
|----|-------|----------|
| PROJECT-1 | As a client with multiple projects, I can switch between them | Should Have |
| PROJECT-2 | As a client, I only see projects assigned to me | Must Have |
| PROJECT-3 | As a client with one project, I don't see a project switcher | Nice to Have |

---

## Pages & Routes

```
/
├── (auth)
│   ├── /sign-in          → Clerk sign-in page
│   └── /sign-in/reset    → Password reset flow
│
├── (protected)           → All routes require authentication
│   ├── /                 → Redirect to /issues or project selector
│   ├── /issues           → Issue list for current project
│   ├── /issues/new       → Create new issue form
│   ├── /issues/[id]      → Issue detail + comments
│   └── /projects         → Project selector (if user has multiple)
│
└── /api
    ├── /api/issues                → GET list, POST create
    ├── /api/issues/[id]           → GET detail
    ├── /api/issues/[id]/comments  → GET list, POST create
    └── /api/projects              → GET user's allowed projects
```

---

## Client Attribution Strategy

All issues are created via a single Linear API key, so Linear will show them as created by the API. To track which client submitted which issue:

### Label-based Attribution

Create a label per client with a consistent prefix:

```
client:acme-corp
client:globex
client:initech
```

When creating an issue, apply both:
1. A generic "client-submitted" label (for filtering all external submissions)
2. The client-specific label (stored in Clerk metadata)

```typescript
await linear.createIssue({
  projectId: "...",
  teamId: "...",
  title: "...",
  description: "...",
  labelIds: [
    process.env.LINEAR_CLIENT_SUBMITTED_LABEL_ID,  // Generic marker
    userMetadata.linearLabelId                      // Client-specific: "client:acme-corp"
  ]
});
```

This enables:
- Filtering all client-submitted issues in Linear
- Filtering issues by specific client
- Creating saved views per client
- Quick visual identification in issue lists

---

## Data Model

### Clerk User Metadata

Stored in `user.publicMetadata` (readable client-side) or `user.privateMetadata` (server-only):

```typescript
// Stored in privateMetadata (recommended)
interface UserMetadata {
  allowedProjects: string[];  // Array of Linear project IDs
  displayName?: string;       // How to identify in Linear comments
  linearLabelId?: string;     // Client-specific label ID (e.g., "client:acme-corp")
}

// Example
{
  "allowedProjects": ["PROJECT_ID_1", "PROJECT_ID_2"],
  "displayName": "Acme Corp",
  "linearLabelId": "LABEL_ID_FOR_CLIENT_ACME"
}
```

### Linear Data Structures (Reference)

The app will work with these Linear types (via @linear/sdk):

```typescript
// Issue (simplified)
interface Issue {
  id: string;
  identifier: string;      // e.g., "PRJ-123"
  title: string;
  description: string;     // Markdown
  state: WorkflowState;
  priority: number;        // 0-4
  assignee?: User;
  labels: Label[];
  createdAt: Date;
  updatedAt: Date;
}

// Comment (simplified)
interface Comment {
  id: string;
  body: string;            // Markdown
  user: User;
  createdAt: Date;
}

// WorkflowState
interface WorkflowState {
  id: string;
  name: string;            // "Backlog", "In Progress", "Done", etc.
  type: string;            // "backlog", "started", "completed", "canceled"
  color: string;
}
```

---

## API Design

All API routes are server-side (Next.js Route Handlers). The Linear API key is stored as an environment variable and never exposed to the client.

### Authentication & Authorization Flow

```
1. Client makes request to /api/issues
2. Server extracts Clerk session → gets userId
3. Server fetches user's privateMetadata → gets allowedProjects
4. Server validates requested projectId is in allowedProjects
5. Server calls Linear API with admin API key
6. Server returns filtered data to client
```

### Endpoints

#### GET /api/projects
Returns list of projects the current user can access.

```typescript
// Response
{
  projects: [
    { id: "xxx", name: "Project Alpha", icon: "🚀" },
    { id: "yyy", name: "Project Beta", icon: "⚡" }
  ]
}
```

#### GET /api/issues?projectId={id}&status={status}
Returns issues for a project.

```typescript
// Response
{
  issues: Issue[],
  nextCursor?: string  // For pagination if needed
}
```

#### POST /api/issues
Creates a new issue.

```typescript
// Request
{
  projectId: string;
  title: string;
  description: string;
  priority?: number;
  labelIds?: string[];
}

// Response
{
  issue: Issue
}
```

#### GET /api/issues/[id]
Returns issue detail. Server validates user has access to the issue's project.

#### GET /api/issues/[id]/comments
Returns comments for an issue.

#### POST /api/issues/[id]/comments
Creates a comment. The comment body should be prefixed with client identifier:

```typescript
// Server-side transformation
const commentBody = `**[${user.displayName || 'Task Bridge Client'}]**: ${body}`;
```

---

## Environment Variables

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

---

## UI Components

### Core Components (from shadcn/ui)

- `Button` — actions
- `Card` — issue cards, detail sections
- `Badge` — status, priority, labels
- `Input`, `Textarea` — forms
- `Select` — filters, priority picker
- `Dialog` — confirmations
- `Skeleton` — loading states
- `Avatar` — assignee display

### Custom Components to Build

| Component | Description |
|-----------|-------------|
| `IssueCard` | Compact issue display for list view |
| `IssueDetail` | Full issue view with metadata sidebar |
| `CommentThread` | List of comments with input |
| `CommentInput` | Markdown-capable textarea with submit |
| `IssueForm` | Create/edit issue form |
| `StatusBadge` | Colored badge based on workflow state |
| `PriorityIcon` | Icon representation of priority (1-4) |
| `ProjectSwitcher` | Dropdown to switch active project |
| `EmptyState` | Friendly message when no issues exist |

---

## Non-Functional Requirements

### Performance
- Issue list should load in <2 seconds
- Use React Query for caching (staleTime: 30 seconds recommended)
- Implement optimistic updates for comments

### Security
- Linear API key must never be exposed client-side
- All API routes must verify Clerk session
- All API routes must verify project access before returning data
- Rate limiting: rely on Linear's limits (1,500 req/hr), but consider caching

### Error Handling
- Graceful error states for API failures
- Toast notifications for actions (success/error)
- Linear API errors should be logged server-side, sanitized client-side

### Accessibility
- All interactive elements keyboard accessible
- Proper heading hierarchy
- Color contrast compliance (shadcn defaults are good)

---

## Out of Scope (V1)

- Real-time updates via webhooks (polling/manual refresh is fine)
- File attachments on issues (can add later)
- Email notifications
- Issue editing (clients can only create, not edit)
- Time tracking
- Multiple workspaces (single Linear workspace only)
- Admin dashboard within the app (use Clerk dashboard)

---

## Future Considerations (V2+)

- Webhook integration for real-time status updates
- File upload support (likely via Linear's attachment API)
- Email notifications when issue status changes
- Client-side issue editing (with audit trail)
- Admin panel to manage users within the app
- Activity feed / changelog view
- Export functionality

---

## Linear API Reference

### Key SDK Methods

```typescript
import { LinearClient } from "@linear/sdk";

const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

// Get project
const project = await linear.project("PROJECT_ID");

// List issues in project
const issues = await linear.issues({
  filter: {
    project: { id: { eq: "PROJECT_ID" } },
    state: { type: { neq: "canceled" } }  // Optional: exclude canceled
  },
  orderBy: LinearDocument.PaginationOrderBy.UpdatedAt
});

// Get single issue
const issue = await linear.issue("ISSUE_ID");

// Get comments
const issue = await linear.issue("ISSUE_ID");
const comments = await issue.comments();

// Create issue
const created = await linear.createIssue({
  projectId: "PROJECT_ID",
  teamId: "TEAM_ID",  // Required - store in env or fetch dynamically
  title: "Issue title",
  description: "Issue description",
  priority: 2,
  labelIds: ["LABEL_ID"]
});

// Create comment
await linear.createComment({
  issueId: "ISSUE_ID",
  body: "Comment text"
});
```

### Getting Team ID

Issues require a `teamId`. Options:
1. Store as environment variable (if single team)
2. Fetch from project: `const project = await linear.project(id); const team = await project.team;`

---

## Implementation Order (Suggested)

### Phase 1: Foundation (Day 1)
1. Next.js project setup with App Router
2. Clerk integration + disable sign-up
3. Environment variables configured
4. Basic layout with navigation

### Phase 2: Core Read (Day 1-2)
1. Linear SDK setup
2. `/api/projects` endpoint
3. `/api/issues` endpoint
4. Issue list page with basic display
5. Project access validation

### Phase 3: Issue Detail (Day 2)
1. `/api/issues/[id]` endpoint
2. Issue detail page
3. Comments display
4. Status/priority badges

### Phase 4: Write Operations (Day 2-3)
1. `/api/issues` POST endpoint
2. Issue creation form
3. `/api/issues/[id]/comments` POST endpoint
4. Comment input component

### Phase 5: Polish (Day 3-4)
1. Loading states
2. Error handling
3. Filtering/sorting
4. Empty states
5. Mobile responsiveness

### Phase 6: Testing & Deploy (Day 4)
1. Test all flows with real Clerk user
2. Test project access restrictions
3. Deploy to Vercel
4. Final QA

---

## Open Questions

1. **Comment attribution**: Should comments show as "Task Bridge" generically, or should each client have their own identifier visible in Linear?

2. **Label management**: Should clients be able to select from existing labels, or should there be a fixed set of "client-facing" labels?

3. **Status visibility**: Should clients see all workflow states, or a simplified view (e.g., "Open", "In Progress", "Done")?

4. **Notification preference**: Do you want to receive notifications differently for client-submitted issues? (e.g., specific Slack channel)

---

## Success Criteria

- [ ] Clients can log in with provided credentials
- [ ] Clients can only see their assigned project(s)
- [ ] Clients can view all issues in their project(s)
- [ ] Clients can view issue details and comments
- [ ] Clients can create new issues with required fields
- [ ] Clients can post comments on existing issues
- [ ] All client-submitted issues are identifiable in Linear
- [ ] No unauthorized project access is possible
- [ ] App is deployed and accessible via custom domain