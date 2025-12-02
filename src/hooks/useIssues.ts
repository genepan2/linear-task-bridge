import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, CreateIssueData, IssueFilters } from '@/lib/api-client';

/**
 * Fetch issues for a project with optional filters
 * @param projectId - Project ID to fetch issues for
 * @param filters - Optional filters (status, priority, assignee, search)
 */
export function useIssues(projectId: string, filters?: IssueFilters) {
  return useQuery({
    queryKey: ['issues', projectId, filters],
    queryFn: () => api.issues.list(projectId, filters),
    enabled: !!projectId, // Only run if projectId exists
  });
}

/**
 * Fetch a single issue by ID
 * @param issueId - Issue ID to fetch
 */
export function useIssue(issueId: string) {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: () => api.issues.get(issueId),
    enabled: !!issueId,
  });
}

/**
 * Create a new issue with optimistic updates
 * Immediately adds the issue to the list, rolls back on error
 */
export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIssueData) => api.issues.create(data),

    // Optimistic update: add issue to list immediately
    onMutate: async (newIssue) => {
      const queryKey = ['issues', newIssue.projectId];

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousIssues = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        const optimisticIssue = {
          id: `temp-${Date.now()}`,
          ...newIssue,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          ...old,
          issues: [optimisticIssue, ...old.issues],
        };
      });

      return { previousIssues, queryKey };
    },

    // On success, replace temp ID with real ID
    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData(context.queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          issues: old.issues.map((issue: any) =>
            issue.id.startsWith('temp-') ? data.issue : issue
          ),
        };
      });

      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: context.queryKey });
    },

    // On error, rollback to previous state
    onError: (_err, _variables, context) => {
      if (context?.previousIssues) {
        queryClient.setQueryData(context.queryKey, context.previousIssues);
      }
    },
  });
}

/**
 * Update an existing issue
 */
export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      issueId,
      data,
    }: {
      issueId: string;
      data: Partial<CreateIssueData>;
    }) => api.issues.update(issueId, data),

    onSuccess: (data, variables) => {
      // Update single issue cache
      queryClient.setQueryData(['issues', variables.issueId], data);

      // Invalidate issues list to refetch
      queryClient.invalidateQueries({
        queryKey: ['issues', data.issue.projectId],
      });
    },
  });
}

/**
 * Delete an issue
 */
export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (issueId: string) => api.issues.delete(issueId),

    onSuccess: (_, issueId) => {
      // Remove from all issues lists
      queryClient.invalidateQueries({ queryKey: ['issues'] });

      // Remove single issue cache
      queryClient.removeQueries({ queryKey: ['issues', issueId] });
    },
  });
}
