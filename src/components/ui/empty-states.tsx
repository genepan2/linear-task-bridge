/**
 * Specific Empty State Components
 * Pre-configured empty states for common scenarios
 */

import { MessageSquare, FolderOpen, FileQuestion } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface IssuesEmptyStateProps {
  hasFilters: boolean;
  onCreateIssue: () => void;
  onClearFilters?: () => void;
}

/**
 * Empty state for issue list when no issues are found
 */
export function IssuesEmptyState({
  hasFilters,
  onCreateIssue,
  onClearFilters,
}: IssuesEmptyStateProps) {
  if (hasFilters) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="No issues match your filters"
        description="Try adjusting your search or filters to find what you're looking for."
        action={{
          label: 'Clear filters',
          onClick: onClearFilters!,
          variant: 'outline',
        }}
        secondaryAction={{
          label: 'Create issue',
          onClick: onCreateIssue,
        }}
      />
    );
  }

  return (
    <EmptyState
      icon={FileQuestion}
      title="No issues yet"
      description="Get started by creating your first issue to track tasks, bugs, or feature requests."
      action={{
        label: 'Create your first issue',
        onClick: onCreateIssue,
      }}
    />
  );
}

interface CommentsEmptyStateProps {
  onAddComment?: () => void;
}

/**
 * Empty state for comments section when no comments exist
 */
export function CommentsEmptyState({ onAddComment }: CommentsEmptyStateProps) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No comments yet"
      description="Start the conversation by adding the first comment. Share updates, ask questions, or provide feedback."
      action={
        onAddComment
          ? {
              label: 'Add first comment',
              onClick: onAddComment,
            }
          : undefined
      }
      className="border-2 border-dashed border-muted rounded-lg"
    />
  );
}

/**
 * Empty state for projects page when no projects are available
 */
export function ProjectsEmptyState() {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No projects available"
      description="You don't have access to any projects yet. Please contact your administrator to get assigned to projects."
    />
  );
}

/**
 * Empty state for generic content
 */
export function GenericEmptyState({
  title = 'No content available',
  description = 'There is no content to display at this time.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      className="border-2 border-dashed border-muted rounded-lg"
    />
  );
}
