import { Project, User, WorkflowState } from '@linear/sdk';

export type LinearProject = Project;
export type LinearUser = User;
export type LinearWorkflowState = WorkflowState;

// User metadata stored in Clerk
export interface UserMetadata {
  allowedProjects: string[];
  displayName?: string;
  linearLabelId?: string;
}

// Plain object version for use in app (not Linear SDK types)
export interface IssueWithRelations {
  id: string;
  identifier: string;
  title: string;
  description?: string | null;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  project?: {
    id: string;
    name: string;
    icon?: string;
  };
  state?: {
    id: string;
    name: string;
    type: string;
    color: string;
  };
}

export interface PaginatedResponse<T> {
  nodes: T[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  };
}

// Re-export all types from linear.ts
export type {
  LinearIssue,
  LinearComment,
  LinearProject as LinearProjectDetailed,
  LinearTeam,
  LinearWorkflowState as LinearWorkflowStateDetailed,
  LinearLabel,
  LinearError,
  IssueFilters,
  CreateIssueInput,
  CommentsResponse,
  Issue,
  Comment,
  PaginatedIssues,
} from './linear';
export { PRIORITY_LABELS } from './linear';
