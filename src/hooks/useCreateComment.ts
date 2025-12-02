import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { LinearComment } from '@/types/linear';

interface CreateCommentParams {
  issueId: string;
  body: string;
}

interface CreateCommentContext {
  previousComments?: LinearComment[];
}

/**
 * Hook to create a new comment on an issue
 * Implements optimistic updates for instant UI feedback
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation<LinearComment, Error, CreateCommentParams, CreateCommentContext>({
    mutationFn: async ({ issueId, body }) => {
      const response = await fetch(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create comment');
      }

      return response.json();
    },
    onMutate: async ({ issueId, body }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comments', issueId] });

      // Snapshot previous value
      const previousComments = queryClient.getQueryData<LinearComment[]>(['comments', issueId]);

      // Optimistically update to the new value
      const optimisticComment: LinearComment = {
        id: `temp-${Date.now()}`,
        body,
        user: {
          id: 'current-user',
          name: 'You',
          email: '',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<LinearComment[]>(
        ['comments', issueId],
        (old = []) => [...old, optimisticComment]
      );

      return { previousComments };
    },
    onError: (_err, { issueId }, context) => {
      // Rollback on error
      if (context?.previousComments) {
        queryClient.setQueryData(['comments', issueId], context.previousComments);
      }
    },
    onSuccess: (_data, { issueId }) => {
      // Invalidate and refetch to ensure data is in sync with server
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
    },
  });
}
