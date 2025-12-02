/**
 * Application Constants
 *
 * Centralized constants for Task Bridge application.
 */

/**
 * Linear priority levels mapping
 */
export const PRIORITY_LABELS = {
  0: { label: 'None', color: 'gray', value: 0 },
  1: { label: 'Urgent', color: 'red', value: 1 },
  2: { label: 'High', color: 'orange', value: 2 },
  3: { label: 'Medium', color: 'yellow', value: 3 },
  4: { label: 'Low', color: 'blue', value: 4 },
} as const;

/**
 * Linear workflow state types with colors
 */
export const STATE_TYPE_COLORS = {
  backlog: {
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
  },
  unstarted: {
    color: 'slate',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    borderColor: 'border-slate-300',
  },
  started: {
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300',
  },
  completed: {
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-300',
  },
  canceled: {
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-300',
  },
} as const;

/**
 * Default values for issue creation
 */
export const DEFAULT_ISSUE_VALUES = {
  priority: 3, // Medium
  description: '',
  labels: [],
} as const;

/**
 * Label prefixes for different issue types
 */
export const LABEL_PREFIXES = {
  type: 'type:',
  priority: 'priority:',
  component: 'component:',
  platform: 'platform:',
  status: 'status:',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  defaultLimit: 50,
  maxLimit: 100,
  minLimit: 10,
} as const;

/**
 * API rate limits
 */
export const RATE_LIMITS = {
  /** Linear API rate limit (requests per minute) */
  linear: 60,
  /** Internal API rate limit (requests per minute) */
  internal: 120,
} as const;

/**
 * Cache durations (in seconds)
 */
export const CACHE_DURATIONS = {
  /** Issue list cache duration */
  issues: 60,
  /** Project list cache duration */
  projects: 300,
  /** User data cache duration */
  user: 600,
  /** Static data cache duration */
  static: 3600,
} as const;

/**
 * API endpoints (relative to base URL)
 */
export const API_ENDPOINTS = {
  issues: '/api/issues',
  issue: (id: string) => `/api/issues/${id}`,
  comments: (issueId: string) => `/api/issues/${issueId}/comments`,
  projects: '/api/projects',
  project: (id: string) => `/api/projects/${id}`,
  teams: '/api/teams',
  team: (id: string) => `/api/teams/${id}`,
  users: '/api/users',
  user: (id: string) => `/api/users/${id}`,
  webhooks: '/api/webhooks',
  health: '/api/health',
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  theme: 'task-bridge-theme',
  filters: 'task-bridge-filters',
  view: 'task-bridge-view',
  recentIssues: 'task-bridge-recent-issues',
  recentProjects: 'task-bridge-recent-projects',
} as const;

/**
 * Query client keys
 */
export const QUERY_KEYS = {
  issues: ['issues'],
  issue: (id: string) => ['issue', id],
  comments: (issueId: string) => ['comments', issueId],
  projects: ['projects'],
  project: (id: string) => ['project', id],
  teams: ['teams'],
  team: (id: string) => ['team', id],
  user: ['user'],
  currentUser: ['currentUser'],
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  unauthorized: 'You must be logged in to perform this action',
  forbidden: 'You do not have permission to perform this action',
  notFound: 'The requested resource was not found',
  validation: 'Please check your input and try again',
  rateLimit: 'Too many requests. Please try again later',
  serverError: 'An unexpected error occurred. Please try again',
  networkError: 'Network error. Please check your connection',
  linearApiError: 'Failed to communicate with Linear API',
  invalidApiKey: 'Invalid or missing Linear API key',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  issueCreated: 'Issue created successfully',
  issueUpdated: 'Issue updated successfully',
  issueDeleted: 'Issue deleted successfully',
  commentCreated: 'Comment added successfully',
  commentUpdated: 'Comment updated successfully',
  commentDeleted: 'Comment deleted successfully',
} as const;

/**
 * Date format strings
 */
export const DATE_FORMATS = {
  full: 'PPP', // e.g., "April 29, 2023"
  short: 'PP', // e.g., "Apr 29, 2023"
  time: 'p', // e.g., "5:45 PM"
  datetime: 'PPp', // e.g., "Apr 29, 2023, 5:45 PM"
  relative: 'relative', // e.g., "2 hours ago"
} as const;

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  createIssue: 'c',
  search: '/',
  escape: 'Escape',
  submit: 'Enter',
  cancel: 'Escape',
} as const;

/**
 * UI breakpoints (must match Tailwind config)
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Maximum file sizes (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  avatar: 5 * 1024 * 1024, // 5MB
  attachment: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Allowed file types
 */
export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf', 'text/plain', 'text/markdown'],
} as const;

/**
 * Application metadata
 */
export const APP_METADATA = {
  name: 'Task Bridge',
  description: 'Linear task management for teams',
  version: '1.0.0',
  author: 'Your Organization',
  repository: 'https://github.com/your-org/task-bridge',
} as const;
