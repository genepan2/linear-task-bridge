import { useQuery } from '@tanstack/react-query';
import type { Issue } from '@/types';

/**
 * Hook to fetch a single issue by ID
 * Automatically caches and refetches data in the background
 */
export function useIssue(issueId: string) {
  return useQuery<Issue>({
    queryKey: ['issue', issueId],
    queryFn: async () => {
      const response = await fetch(`/api/issues/${issueId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch issue');
      }
      return response.json();
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2,
  });
}
