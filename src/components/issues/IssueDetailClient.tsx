'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { markdownComponents } from '@/lib/markdown';
import { useIssue } from '@/hooks/useIssue';
import { useComments } from '@/hooks/useComments';
import { IssueMetadataSidebar } from './IssueMetadataSidebar';
import { CommentThread } from './CommentThread';
import { CommentInput } from './CommentInput';

interface IssueDetailClientProps {
  issueId: string;
}

/**
 * IssueDetailClient - Main issue detail view component
 *
 * Features:
 * - Displays issue identifier (PRJ-123) as header
 * - Renders title prominently
 * - Shows markdown description
 * - Sidebar with metadata (status, priority, labels, assignee, dates)
 * - Comment thread with all comments
 * - Comment input with optimistic updates
 * - Back navigation to issues list
 */
export function IssueDetailClient({ issueId }: IssueDetailClientProps) {
  const router = useRouter();
  const { data: issue, isLoading: issueLoading, error: issueError } = useIssue(issueId);
  const { data: commentsData, isLoading: commentsLoading } = useComments(issueId);

  // Loading state
  if (issueLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error state
  if (issueError || !issue) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/issues')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Issues
        </Button>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">
              {issueError?.message || 'Issue not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/issues')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Issues
      </Button>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Header */}
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground font-mono">
              {issue.identifier}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {issue.title}
            </h1>
          </div>

          {/* Issue Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {issue.description ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={markdownComponents}
                  >
                    {issue.description}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  No description provided
                </p>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>
                Comments
                {!commentsLoading && commentsData?.comments && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({commentsData.comments.length})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comment Thread */}
              <CommentThread
                comments={commentsData?.comments || []}
                isLoading={commentsLoading}
              />

              {/* Comment Input */}
              <div className="pt-6 border-t">
                <CommentInput issueId={issueId} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (1/3 width on large screens) */}
        <div className="lg:col-span-1">
          <IssueMetadataSidebar issue={issue} />
        </div>
      </div>
    </div>
  );
}
