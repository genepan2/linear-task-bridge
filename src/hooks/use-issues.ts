/**
 * TanStack Query hook for fetching and managing issues
 */
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { LinearIssue, IssueFilters, PaginatedIssues } from '@/types/linear';

interface UseIssuesOptions {
  projectId: string;
  filters?: IssueFilters;
  enabled?: boolean;
}

export function useIssues({ projectId, filters, enabled = true }: UseIssuesOptions) {
  const queryClient = useQueryClient();

  const queryKey = ['issues', projectId, filters];

  const query = useQuery<PaginatedIssues>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        projectId,
        ...(filters?.status && { status: filters.status }),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.sort && { sort: filters.sort }),
        ...(filters?.order && { order: filters.order }),
      });

      const response = await fetch(`/api/issues?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch issues');
      }

      return response.json();
    },
    enabled: enabled && !!projectId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    ...query,
    refresh,
  };
}

// Hook for single issue detail
export function useIssue(issueId: string | null) {
  return useQuery<LinearIssue>({
    queryKey: ['issue', issueId],
    queryFn: async () => {
      if (!issueId) throw new Error('Issue ID is required');

      const response = await fetch(`/api/issues/${issueId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch issue');
      }

      return response.json();
    },
    enabled: !!issueId,
    staleTime: 30 * 1000,
  });
}

// Hook for workflow states (for status filter)
export function useWorkflowStates(projectId: string) {
  return useQuery<Array<{ id: string; name: string; type: string; color: string }>>({
    queryKey: ['workflow-states', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}/states`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch workflow states');
      }

      return response.json();
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000, // 5 minutes (states change rarely)
  });
}
