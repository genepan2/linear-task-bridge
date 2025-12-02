/**
 * Linear Utility Helpers
 *
 * Helper functions for formatting and transforming Linear data.
 */

import type { LinearIssue, LinearWorkflowState } from "@/types/linear";

/**
 * Priority levels in Linear
 */
export const PRIORITY_LEVELS = {
  0: { label: "None", color: "#95A2B3", icon: "○" },
  1: { label: "Urgent", color: "#F5455C", icon: "🔴" },
  2: { label: "High", color: "#FFA629", icon: "🟠" },
  3: { label: "Medium", color: "#5E6AD2", icon: "🟡" },
  4: { label: "Low", color: "#95A2B3", icon: "🟢" },
} as const;

/**
 * Workflow state types
 */
export const STATE_TYPES = {
  backlog: { label: "Backlog", color: "#95A2B3", category: "inactive" },
  unstarted: { label: "To Do", color: "#5E6AD2", category: "inactive" },
  started: { label: "In Progress", color: "#FFA629", category: "active" },
  completed: { label: "Done", color: "#0FA958", category: "complete" },
  canceled: { label: "Canceled", color: "#95A2B3", category: "complete" },
} as const;

/**
 * Get priority label from priority number
 *
 * @param priority - Priority number (0-4)
 * @returns Priority label
 */
export function getPriorityLabel(priority: number): string {
  if (priority in PRIORITY_LEVELS) {
    return PRIORITY_LEVELS[priority as keyof typeof PRIORITY_LEVELS].label;
  }
  return PRIORITY_LEVELS[0].label;
}

/**
 * Get priority color from priority number
 *
 * @param priority - Priority number (0-4)
 * @returns Priority color hex code
 */
export function getPriorityColor(priority: number): string {
  if (priority in PRIORITY_LEVELS) {
    return PRIORITY_LEVELS[priority as keyof typeof PRIORITY_LEVELS].color;
  }
  return PRIORITY_LEVELS[0].color;
}

/**
 * Get priority icon from priority number
 *
 * @param priority - Priority number (0-4)
 * @returns Priority icon emoji
 */
export function getPriorityIcon(priority: number): string {
  if (priority in PRIORITY_LEVELS) {
    return PRIORITY_LEVELS[priority as keyof typeof PRIORITY_LEVELS].icon;
  }
  return PRIORITY_LEVELS[0].icon;
}

/**
 * Get display label for workflow state type
 *
 * @param stateType - State type
 * @returns Display label
 */
export function getStateTypeLabel(
  stateType: LinearWorkflowState['type']
): string {
  return STATE_TYPES[stateType]?.label ?? stateType;
}

/**
 * Get color for workflow state type
 *
 * @param stateType - State type
 * @returns Color hex code
 */
export function getStateTypeColor(
  stateType: LinearWorkflowState['type']
): string {
  return STATE_TYPES[stateType]?.color ?? "#95A2B3";
}

/**
 * Get category for workflow state type
 *
 * @param stateType - State type
 * @returns Category (inactive, active, complete)
 */
export function getStateCategory(
  stateType: LinearWorkflowState['type']
): 'inactive' | 'active' | 'complete' {
  return STATE_TYPES[stateType]?.category ?? 'inactive';
}

/**
 * Check if issue is completed
 *
 * @param issue - Linear issue
 * @returns True if issue is completed
 */
export function isIssueCompleted(issue: LinearIssue): boolean {
  return issue.state.type === 'completed';
}

/**
 * Check if issue is canceled
 *
 * @param issue - Linear issue
 * @returns True if issue is canceled
 */
export function isIssueCanceled(issue: LinearIssue): boolean {
  return issue.state.type === 'canceled';
}

/**
 * Check if issue is active (started)
 *
 * @param issue - Linear issue
 * @returns True if issue is in progress
 */
export function isIssueActive(issue: LinearIssue): boolean {
  return issue.state.type === 'started';
}

/**
 * Check if issue is inactive (backlog or unstarted)
 *
 * @param issue - Linear issue
 * @returns True if issue is not started
 */
export function isIssueInactive(issue: LinearIssue): boolean {
  return issue.state.type === 'backlog' || issue.state.type === 'unstarted';
}

/**
 * Format issue identifier with emoji for priority
 *
 * @param issue - Linear issue
 * @returns Formatted identifier (e.g., "🔴 PROJ-123")
 */
export function formatIssueIdentifierWithPriority(issue: LinearIssue): string {
  const icon = getPriorityIcon(issue.priority);
  return `${icon} ${issue.identifier}`;
}

/**
 * Get relative time string for a date
 *
 * @param isoDate - ISO date string
 * @returns Relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
  if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  if (diffWeek > 0) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  return 'just now';
}

/**
 * Format date for display
 *
 * @param isoDate - ISO date string
 * @returns Formatted date string (e.g., "Jan 15, 2025")
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format date and time for display
 *
 * @param isoDate - ISO date string
 * @returns Formatted date and time string (e.g., "Jan 15, 2025 at 3:45 PM")
 */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

/**
 * Lighten a color by a percentage
 *
 * @param color - Hex color code
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened color hex code
 */
export function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;

  return "#" + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

/**
 * Darken a color by a percentage
 *
 * @param color - Hex color code
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened color hex code
 */
export function darkenColor(color: string, percent: number): string {
  return lightenColor(color, -percent);
}

/**
 * Get contrast text color (black or white) for a background color
 *
 * @param backgroundColor - Background color hex code
 * @returns "#000000" or "#FFFFFF"
 */
export function getContrastTextColor(backgroundColor: string): string {
  const num = parseInt(backgroundColor.replace("#", ""), 16);
  const R = (num >> 16) & 0xff;
  const G = (num >> 8) & 0xff;
  const B = num & 0xff;

  // Calculate relative luminance
  const luminance = (0.299 * R + 0.587 * G + 0.114 * B) / 255;

  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Parse Linear issue identifier to get team key and issue number
 *
 * @param identifier - Issue identifier (e.g., "PROJ-123")
 * @returns Object with team key and issue number
 */
export function parseIssueIdentifier(identifier: string): {
  teamKey: string;
  issueNumber: number;
} | null {
  const match = identifier.match(/^([A-Z]+)-(\d+)$/);
  if (!match || !match[1] || !match[2]) return null;

  return {
    teamKey: match[1],
    issueNumber: parseInt(match[2], 10),
  };
}

/**
 * Sort issues by priority (urgent first, then high, medium, low, none)
 *
 * @param issues - Array of issues
 * @returns Sorted array of issues
 */
export function sortIssuesByPriority(issues: LinearIssue[]): LinearIssue[] {
  return [...issues].sort((a, b) => a.priority - b.priority);
}

/**
 * Group issues by state
 *
 * @param issues - Array of issues
 * @returns Map of state name to issues
 */
export function groupIssuesByState(
  issues: LinearIssue[]
): Map<string, LinearIssue[]> {
  const grouped = new Map<string, LinearIssue[]>();

  for (const issue of issues) {
    const stateName = issue.state.name;
    const existing = grouped.get(stateName) ?? [];
    grouped.set(stateName, [...existing, issue]);
  }

  return grouped;
}

/**
 * Group issues by assignee
 *
 * @param issues - Array of issues
 * @returns Map of assignee name to issues (unassigned issues under "Unassigned")
 */
export function groupIssuesByAssignee(
  issues: LinearIssue[]
): Map<string, LinearIssue[]> {
  const grouped = new Map<string, LinearIssue[]>();

  for (const issue of issues) {
    const assigneeName = issue.assignee?.name ?? "Unassigned";
    const existing = grouped.get(assigneeName) ?? [];
    grouped.set(assigneeName, [...existing, issue]);
  }

  return grouped;
}

/**
 * Filter issues by search query
 *
 * @param issues - Array of issues
 * @param query - Search query
 * @returns Filtered array of issues
 */
export function searchIssues(issues: LinearIssue[], query: string): LinearIssue[] {
  const lowerQuery = query.toLowerCase();

  return issues.filter(issue =>
    issue.title.toLowerCase().includes(lowerQuery) ||
    issue.description?.toLowerCase().includes(lowerQuery) ||
    issue.identifier.toLowerCase().includes(lowerQuery)
  );
}
