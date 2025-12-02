/**
 * API Request and Response Types
 *
 * Type definitions for all API endpoints in Task Bridge.
 */

import type { LinearIssue, LinearComment, LinearProject, CreateIssueInput } from './linear';

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T;
  /** Response status */
  success: boolean;
  /** Optional message */
  message?: string;
  /** Response timestamp */
  timestamp: number;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  /** Error message */
  error: string;
  /** Error code */
  code: string;
  /** HTTP status code */
  status: number;
  /** Additional error details */
  details?: unknown;
  /** Error timestamp */
  timestamp: number;
  /** Request ID for tracking */
  requestId?: string;
}

/**
 * Issue list request parameters
 */
export interface GetIssuesRequest {
  /** Filter by status */
  status?: string;
  /** Search query */
  search?: string;
  /** Sort field */
  sortBy?: 'createdAt' | 'updatedAt' | 'priority';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
  /** Filter by assignee */
  assigneeId?: string;
  /** Filter by labels */
  labelIds?: string[];
  /** Filter by project */
  projectId?: string;
  /** Page number (for pagination) */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Issue list response
 */
export interface GetIssuesResponse {
  /** Array of issues */
  issues: LinearIssue[];
  /** Total count (for pagination) */
  total: number;
  /** Current page */
  page: number;
  /** Items per page */
  limit: number;
  /** Has more pages */
  hasMore: boolean;
}

/**
 * Create issue request
 */
export interface CreateIssueRequest extends CreateIssueInput {
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Create issue response
 */
export interface CreateIssueResponse {
  /** Created issue */
  issue: LinearIssue;
  /** Success message */
  message: string;
}

/**
 * Update issue request
 */
export interface UpdateIssueRequest {
  /** Issue ID */
  id: string;
  /** Updated title */
  title?: string;
  /** Updated description */
  description?: string;
  /** Updated priority */
  priority?: number;
  /** Updated state ID */
  stateId?: string;
  /** Updated assignee ID */
  assigneeId?: string;
  /** Updated label IDs */
  labelIds?: string[];
}

/**
 * Update issue response
 */
export interface UpdateIssueResponse {
  /** Updated issue */
  issue: LinearIssue;
  /** Success message */
  message: string;
}

/**
 * Delete issue request
 */
export interface DeleteIssueRequest {
  /** Issue ID */
  id: string;
}

/**
 * Delete issue response
 */
export interface DeleteIssueResponse {
  /** Success status */
  success: boolean;
  /** Success message */
  message: string;
}

/**
 * Get comments request
 */
export interface GetCommentsRequest {
  /** Issue ID */
  issueId: string;
  /** Page number */
  page?: number;
  /** Items per page */
  limit?: number;
}

/**
 * Get comments response
 */
export interface GetCommentsResponse {
  /** Array of comments */
  comments: LinearComment[];
  /** Total count */
  total: number;
  /** Has more pages */
  hasMore: boolean;
}

/**
 * Create comment request
 */
export interface CreateCommentRequest {
  /** Issue ID */
  issueId: string;
  /** Comment body in markdown */
  body: string;
}

/**
 * Create comment response
 */
export interface CreateCommentResponse {
  /** Created comment */
  comment: LinearComment;
  /** Success message */
  message: string;
}

/**
 * Get projects request
 */
export interface GetProjectsRequest {
  /** Filter by team ID */
  teamId?: string;
  /** Filter by state */
  state?: 'planned' | 'started' | 'paused' | 'completed' | 'canceled';
  /** Include archived projects */
  includeArchived?: boolean;
}

/**
 * Get projects response
 */
export interface GetProjectsResponse {
  /** Array of projects */
  projects: LinearProject[];
  /** Total count */
  total: number;
}

/**
 * Validation error details
 */
export interface ValidationError {
  /** Field name */
  field: string;
  /** Error message */
  message: string;
  /** Validation rule that failed */
  rule?: string;
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ApiErrorResponse {
  /** Array of field validation errors */
  errors: ValidationError[];
}

/**
 * Rate limit error response
 */
export interface RateLimitErrorResponse extends ApiErrorResponse {
  /** Retry after (seconds) */
  retryAfter: number;
  /** Rate limit details */
  rateLimit: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

/**
 * Authentication error response
 */
export interface AuthErrorResponse extends ApiErrorResponse {
  /** Whether to redirect to login */
  redirectToLogin: boolean;
  /** Login URL */
  loginUrl?: string;
}
