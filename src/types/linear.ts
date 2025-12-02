/**
 * Linear API Type Definitions
 *
 * Typed interfaces for Linear SDK integration in Task Bridge.
 * These types provide strong typing for all Linear API operations.
 */

/**
 * Filters for querying Linear issues
 */
export interface IssueFilters {
  /** Filter by issue status (e.g., 'backlog', 'todo', 'in progress', 'done', 'canceled') */
  status?: string;
  /** Search query string for issue title/description */
  search?: string;
  /** Field to sort results by */
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  /** Sort order direction */
  sortOrder?: 'asc' | 'desc';
  /** Filter by assignee ID */
  assigneeId?: string;
  /** Filter by label IDs */
  labelIds?: string[];
  /** Field to sort results by (alias for backward compatibility) */
  sort?: 'created' | 'updated' | 'priority';
  /** Sort order direction (alias for backward compatibility) */
  order?: 'asc' | 'desc';
}

/**
 * Input data for creating a new Linear issue
 */
export interface CreateIssueInput {
  /** Linear project ID */
  projectId: string;
  /** Issue title */
  title: string;
  /** Issue description in markdown */
  description: string;
  /** Priority level (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low) */
  priority?: number;
  /** Array of label IDs to apply */
  labelIds?: string[];
  /** Assignee user ID */
  assigneeId?: string;
  /** State ID (status) */
  stateId?: string;
}

/**
 * Linear issue with full details
 */
export interface LinearIssue {
  /** Unique issue ID */
  id: string;
  /** Human-readable identifier (e.g., "PROJ-123") */
  identifier: string;
  /** Issue title */
  title: string;
  /** Issue description in markdown */
  description: string | null;
  /** Current state/status */
  state: {
    id: string;
    name: string;
    type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
    color: string;
  };
  /** Priority level (0=None, 1=Urgent, 2=High, 3=Medium, 4=Low) */
  priority: number;
  /** Assigned user */
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  /** Labels applied to the issue */
  labels: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  /** Project the issue belongs to */
  project?: {
    id: string;
    name: string;
    icon?: string;
  };
  /** Team the issue belongs to */
  team: {
    id: string;
    name: string;
    key: string;
  };
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** URL to view the issue in Linear */
  url: string;
}

/**
 * Linear comment/activity on an issue
 */
export interface LinearComment {
  /** Unique comment ID */
  id: string;
  /** Comment body in markdown */
  body: string;
  /** User who created the comment */
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** Whether this is a system-generated comment */
  isSystem?: boolean;
}

/**
 * Linear project details
 */
export interface LinearProject {
  /** Unique project ID */
  id: string;
  /** Project name */
  name: string;
  /** Project icon (emoji or URL) */
  icon?: string;
  /** Project description */
  description?: string;
  /** Project color hex code */
  color?: string;
  /** Project state (planned, started, paused, completed, canceled) */
  state: 'planned' | 'started' | 'paused' | 'completed' | 'canceled';
  /** Team the project belongs to */
  team: {
    id: string;
    name: string;
    key: string;
  };
  /** Project lead */
  lead?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  /** ISO timestamp of creation */
  createdAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** URL to view the project in Linear */
  url: string;
  /** Total issue count */
  issueCount?: number;
  /** Completed issue count */
  completedIssueCount?: number;
}

/**
 * Linear team details
 */
export interface LinearTeam {
  /** Unique team ID */
  id: string;
  /** Team name */
  name: string;
  /** Team key (prefix for issue identifiers) */
  key: string;
  /** Team description */
  description?: string;
  /** Team icon */
  icon?: string;
  /** Team color */
  color?: string;
}

/**
 * Linear workflow state
 */
export interface LinearWorkflowState {
  /** Unique state ID */
  id: string;
  /** State name */
  name: string;
  /** State type */
  type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled';
  /** State color */
  color: string;
  /** Position in workflow */
  position: number;
}

/**
 * Linear label
 */
export interface LinearLabel {
  /** Unique label ID */
  id: string;
  /** Label name */
  name: string;
  /** Label description */
  description?: string;
  /** Label color hex code */
  color: string;
}

/**
 * Error response from Linear API
 */
export interface LinearError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** HTTP status code */
  status?: number;
  /** Additional error details */
  details?: unknown;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  /** Array of items */
  nodes: T[];
  /** Pagination info */
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

/**
 * Response wrapper for comments list
 */
export interface CommentsResponse {
  /** Array of comments */
  comments: LinearComment[];
}

/**
 * Priority labels mapping
 */
export const PRIORITY_LABELS: Record<number, string> = {
  0: 'None',
  1: 'Urgent',
  2: 'High',
  3: 'Medium',
  4: 'Low',
} as const;

/**
 * Type aliases for backwards compatibility
 */
export type Issue = LinearIssue;
export type Comment = LinearComment;

/**
 * Paginated issues response
 */
export interface PaginatedIssues {
  /** Array of issues */
  issues: LinearIssue[];
  /** Pagination info */
  pageInfo?: {
    hasNextPage: boolean;
    endCursor?: string;
  };
}
