import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, CreateCommentData } from '@/lib/api-client';

/**
 * Fetch all comments for an issue
 * @param issueId - Issue ID to fetch comments for
 */
export function useComments(issueId: string) {
  return useQuery({
    queryKey: ['comments', issueId],
    queryFn: () => api.comments.list(issueId),
    enabled: !!issueId,
  });
}

/**
 * Create a new comment with optimistic updates
 * Shows comment immediately, rolls back on error
 * @param issueId - Issue ID to add comment to
 */
export function useCreateComment(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCommentData) => api.comments.create(issueId, data),

    // Optimistic update: add comment immediately
    onMutate: async (newComment) => {
      const queryKey = ['comments', issueId];

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousComments = queryClient.getQueryData(queryKey);

      // Optimistically update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;

        const optimisticComment = {
          id: `temp-${Date.now()}`,
          ...newComment,
          authorId: 'current-user', // Would come from auth context
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return {
          ...old,
          comments: [...old.comments, optimisticComment],
        };
      });

      return { previousComments, queryKey };
    },

    // On success, replace temp ID with real ID
    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData(context.queryKey, (old: any) => {
        if (!old) return old;

        return {
          ...old,
          comments: old.comments.map((comment: any) =>
            comment.id.startsWith('temp-') ? data.comment : comment
          ),
        };
      });

      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: context.queryKey });
    },

    // On error, rollback
    onError: (_err, _variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(context.queryKey, context.previousComments);
      }
    },
  });
}

/**
 * Delete a comment
 */
export function useDeleteComment(issueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) => api.comments.delete(issueId, commentId),

    onSuccess: (_data, _commentId) => {
      // Invalidate comments list to refetch
      queryClient.invalidateQueries({ queryKey: ['comments', issueId] });
    },
  });
}
