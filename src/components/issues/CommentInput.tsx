'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateComment } from '@/hooks/useCreateComment';
import { Loader2 } from 'lucide-react';

interface CommentInputProps {
  issueId: string;
  onSuccess?: () => void;
}

/**
 * CommentInput component for posting new comments
 * Includes optimistic updates and error handling
 */
export function CommentInput({ issueId, onSuccess }: CommentInputProps) {
  const [body, setBody] = useState('');
  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!body.trim()) return;

    try {
      await createComment.mutateAsync({
        issueId,
        body: body.trim(),
      });

      setBody(''); // Clear input on success
      onSuccess?.();
    } catch (error) {
      // Error handling - could add toast notification here
      console.error('Failed to post comment:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment... (Markdown supported)"
          className="min-h-[100px]"
          disabled={createComment.isPending}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Supports **bold**, *italic*, [links](url), and more
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {createComment.isError && (
            <span className="text-destructive">
              Failed to post comment. Please try again.
            </span>
          )}
        </div>
        <Button
          type="submit"
          disabled={!body.trim() || createComment.isPending}
        >
          {createComment.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Post Comment
        </Button>
      </div>
    </form>
  );
}
