/**
 * Application Routes Configuration
 *
 * Type-safe route constants and helper functions.
 */

/**
 * Public routes (accessible without authentication)
 */
export const PUBLIC_ROUTES = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  privacy: '/privacy',
  terms: '/terms',
} as const;

/**
 * Protected routes (require authentication)
 */
export const PROTECTED_ROUTES = {
  dashboard: '/dashboard',
  issues: '/issues',
  issue: (id: string) => `/issues/${id}`,
  createIssue: '/issues/new',
  editIssue: (id: string) => `/issues/${id}/edit`,
  projects: '/projects',
  project: (id: string) => `/projects/${id}`,
  settings: '/settings',
  profile: '/profile',
  team: '/team',
  integrations: '/integrations',
} as const;

/**
 * API routes
 */
export const API_ROUTES = {
  base: '/api',
  // Issues
  issues: '/api/issues',
  issue: (id: string) => `/api/issues/${id}`,
  createIssue: '/api/issues',
  updateIssue: (id: string) => `/api/issues/${id}`,
  deleteIssue: (id: string) => `/api/issues/${id}`,
  // Comments
  comments: (issueId: string) => `/api/issues/${issueId}/comments`,
  createComment: (issueId: string) => `/api/issues/${issueId}/comments`,
  updateComment: (issueId: string, commentId: string) =>
    `/api/issues/${issueId}/comments/${commentId}`,
  deleteComment: (issueId: string, commentId: string) =>
    `/api/issues/${issueId}/comments/${commentId}`,
  // Projects
  projects: '/api/projects',
  project: (id: string) => `/api/projects/${id}`,
  // Teams
  teams: '/api/teams',
  team: (id: string) => `/api/teams/${id}`,
  // Users
  users: '/api/users',
  user: (id: string) => `/api/users/${id}`,
  currentUser: '/api/users/me',
  // Webhooks
  webhooks: '/api/webhooks',
  linearWebhook: '/api/webhooks/linear',
  clerkWebhook: '/api/webhooks/clerk',
  // Health & Status
  health: '/api/health',
  status: '/api/status',
} as const;

/**
 * External routes
 */
export const EXTERNAL_ROUTES = {
  linear: 'https://linear.app',
  linearIssue: (teamKey: string, issueNumber: number) =>
    `https://linear.app/team/${teamKey}/issue/${teamKey}-${issueNumber}`,
  linearProject: (projectId: string) =>
    `https://linear.app/project/${projectId}`,
  clerk: 'https://clerk.com',
  github: 'https://github.com',
  docs: '/docs',
  support: '/support',
} as const;

/**
 * Clerk auth routes
 */
export const CLERK_ROUTES = {
  signIn: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
  signUp: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
  afterSignIn: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || '/issues',
  afterSignUp: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || '/issues',
} as const;

/**
 * Route helper functions
 */

/**
 * Check if a route is public
 */
export function isPublicRoute(path: string): boolean {
  return Object.values(PUBLIC_ROUTES).includes(path as any);
}

/**
 * Check if a route is protected
 */
export function isProtectedRoute(path: string): boolean {
  // Check exact matches
  if (Object.values(PROTECTED_ROUTES).includes(path as any)) {
    return true;
  }
  // Check dynamic routes
  const protectedPrefixes = ['/issues', '/projects', '/settings', '/profile', '/team'];
  return protectedPrefixes.some(prefix => path.startsWith(prefix));
}

/**
 * Check if a route is an API route
 */
export function isApiRoute(path: string): boolean {
  return path.startsWith('/api');
}

/**
 * Get redirect URL after authentication
 */
export function getAuthRedirectUrl(intendedPath?: string): string {
  if (intendedPath && isProtectedRoute(intendedPath)) {
    return intendedPath;
  }
  return CLERK_ROUTES.afterSignIn;
}

/**
 * Build query string from params
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Build full URL with query params
 */
export function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params) return path;
  const queryString = buildQueryString(params);
  return `${path}${queryString}`;
}

/**
 * Parse issue identifier (e.g., "TEAM-123" -> { teamKey: "TEAM", number: 123 })
 */
export function parseIssueIdentifier(identifier: string): { teamKey: string; number: number } | null {
  const match = identifier.match(/^([A-Z]+)-(\d+)$/);
  if (!match || !match[1] || !match[2]) return null;

  return {
    teamKey: match[1],
    number: parseInt(match[2], 10),
  };
}

/**
 * Get Linear issue URL from identifier
 */
export function getLinearIssueUrl(identifier: string): string | null {
  const parsed = parseIssueIdentifier(identifier);
  if (!parsed) return null;

  return EXTERNAL_ROUTES.linearIssue(parsed.teamKey || '', parsed.number || 0);
}

/**
 * Navigate to issue
 */
export function getIssueUrl(id: string): string {
  return PROTECTED_ROUTES.issue(id);
}

/**
 * Navigate to project
 */
export function getProjectUrl(id: string): string {
  return PROTECTED_ROUTES.project(id);
}

/**
 * Type-safe route params
 */
export type RouteParams = {
  [K in keyof typeof PROTECTED_ROUTES]: typeof PROTECTED_ROUTES[K] extends ((...args: infer P) => string)
    ? P
    : never;
};
