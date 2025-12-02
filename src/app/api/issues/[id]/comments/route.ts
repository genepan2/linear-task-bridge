import { NextRequest, NextResponse } from 'next/server';
import { linearClient } from '@/lib/linear';
import { requireAuth, validateProjectAccess, getCurrentUserDisplayName } from '@/lib/auth';
import type { LinearComment } from '@/types/linear';

/**
 * GET /api/issues/[id]/comments
 * Fetch all comments for a specific Linear issue
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing the issue ID
 * @returns JSON response with array of comments or error
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    await requireAuth();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      );
    }

    // Fetch issue from Linear
    const issue = await linearClient.issue(id);

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // Get issue's project for access validation
    const project = await issue.project;

    if (!project) {
      return NextResponse.json(
        { error: 'Issue does not belong to any project' },
        { status: 404 }
      );
    }

    // Validate user has access to this project
    const hasAccess = await validateProjectAccess(project.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this project' },
        { status: 403 }
      );
    }

    // Fetch comments from Linear
    const commentsResponse = await issue.comments();

    if (!commentsResponse) {
      return NextResponse.json({ comments: [] });
    }

    // Format comments to match LinearComment type
    const comments: LinearComment[] = await Promise.all(
      commentsResponse.nodes.map(async (comment) => {
        const user = await comment.user;

        return {
          id: comment.id,
          body: comment.body,
          user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl || undefined,
              }
            : {
                id: 'unknown',
                name: 'Unknown User',
                email: 'unknown@example.com',
              },
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt.toISOString(),
          isSystem: false, // Linear SDK doesn't expose this, could be inferred from user type
        };
      })
    );

    // Sort comments by creation date (oldest first)
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return NextResponse.json({ comments });
  } catch (error) {
    console.error('[API] Error fetching comments:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/issues/[id]/comments
 * Create a new comment on a Linear issue
 *
 * The comment body is automatically prefixed with the client's display name
 * to attribute the comment in Linear (e.g., "**[ClientName]**: comment text")
 *
 * @param request - Next.js request object with JSON body { body: string }
 * @param params - Route parameters containing the issue ID
 * @returns JSON response with created comment or error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    await requireAuth();

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    let body: string;
    try {
      const requestData = await request.json();
      body = requestData.body;
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Validate comment body
    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment body is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Fetch issue from Linear
    const issue = await linearClient.issue(id);

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // Get issue's project for access validation
    const project = await issue.project;

    if (!project) {
      return NextResponse.json(
        { error: 'Issue does not belong to any project' },
        { status: 404 }
      );
    }

    // Validate user has access to this project
    const hasAccess = await validateProjectAccess(project.id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'You do not have access to this project' },
        { status: 403 }
      );
    }

    // Get current user's display name for attribution
    const displayName = await getCurrentUserDisplayName();

    // Prefix comment body with client identifier
    const attributedBody = `**[${displayName}]**: ${body.trim()}`;

    // Create comment in Linear
    const commentPayload = await linearClient.createComment({
      issueId: id,
      body: attributedBody,
    });

    // Check if comment creation was successful
    if (!commentPayload.success) {
      console.error('[API] Failed to create comment:', commentPayload);
      return NextResponse.json(
        { error: 'Failed to create comment in Linear' },
        { status: 500 }
      );
    }

    // Fetch the created comment to return full details
    const createdComment = await commentPayload.comment;

    if (!createdComment) {
      return NextResponse.json(
        { error: 'Comment created but could not fetch details' },
        { status: 500 }
      );
    }

    // Get comment user
    const commentUser = await createdComment.user;

    // Format response
    const formattedComment: LinearComment = {
      id: createdComment.id,
      body: createdComment.body,
      user: commentUser
        ? {
            id: commentUser.id,
            name: commentUser.name,
            email: commentUser.email,
            avatarUrl: commentUser.avatarUrl || undefined,
          }
        : {
            id: 'unknown',
            name: 'Unknown User',
            email: 'unknown@example.com',
          },
      createdAt: createdComment.createdAt.toISOString(),
      updatedAt: createdComment.updatedAt.toISOString(),
      isSystem: false,
    };

    return NextResponse.json(
      { comment: formattedComment },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Error creating comment:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
