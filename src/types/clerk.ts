/**
 * Clerk Authentication Type Extensions
 *
 * Type augmentation for Clerk user metadata and custom types.
 */

/**
 * Custom user metadata stored in Clerk privateMetadata
 * This contains project access and Linear attribution information per PRD
 */
export interface UserMetadata {
  /** Array of Linear project IDs the user has access to */
  allowedProjects: string[];
  /** Display name shown in Linear comments (e.g., "Acme Corp") */
  displayName?: string;
  /** Linear label ID for client attribution (e.g., label ID for "client:acme-corp") */
  linearLabelId?: string;
}

/**
 * Augment Clerk's User type with our custom metadata
 * Using privateMetadata as recommended in PRD for security
 */
declare module '@clerk/nextjs' {
  interface UserPrivateMetadata extends UserMetadata {}
}

/**
 * Extended user type with Task Bridge metadata
 */
export interface ExtendedUser {
  /** Clerk user ID */
  id: string;
  /** User email */
  email: string;
  /** User full name */
  name: string;
  /** User avatar URL */
  avatarUrl?: string;
  /** Private metadata with project access */
  privateMetadata: UserMetadata;
}

/**
 * Session metadata
 */
export interface SessionMetadata {
  /** Session ID */
  sessionId: string;
  /** User ID */
  userId: string;
  /** Session start timestamp */
  startedAt: string;
  /** Session expiration timestamp */
  expiresAt: string;
  /** IP address */
  ipAddress?: string;
  /** User agent */
  userAgent?: string;
}

/**
 * Organization metadata
 */
export interface OrganizationMetadata {
  /** Linear workspace ID */
  linearWorkspaceId?: string;
  /** Linear workspace name */
  linearWorkspaceName?: string;
  /** Organization subscription tier */
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
  /** Organization settings */
  settings?: {
    /** Allow members to connect personal Linear accounts */
    allowPersonalLinearAccounts?: boolean;
    /** Require Linear integration for all members */
    requireLinearIntegration?: boolean;
  };
}

/**
 * Clerk webhook event types
 */
export type ClerkWebhookEvent =
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'session.created'
  | 'session.ended'
  | 'organization.created'
  | 'organization.updated'
  | 'organization.deleted'
  | 'organizationMembership.created'
  | 'organizationMembership.updated'
  | 'organizationMembership.deleted';

/**
 * Clerk webhook payload
 */
export interface ClerkWebhookPayload<T = unknown> {
  /** Event type */
  type: ClerkWebhookEvent;
  /** Event data */
  data: T;
  /** Event object type */
  object: string;
  /** Event timestamp */
  timestamp: number;
}
