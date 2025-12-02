import { NextRequest, NextResponse } from 'next/server';
import { linearClient } from '@/lib/linear';
import { requireAuth, validateProjectAccess } from '@/lib/auth';
import type { LinearIssue } from '@/types/linear';

/**
 * GET /api/issues/[id]
 * Fetch a single Linear issue by ID with full details
 *
 * @param request - Next.js request object
 * @param params - Route parameters containing the issue ID
 * @returns JSON response with issue data or error
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

    // Fetch related data
    const [state, team, assignee, labels] = await Promise.all([
      issue.state,
      issue.team,
      issue.assignee,
      issue.labels(),
    ]);

    // Validate issue has required team
    if (!team) {
      return NextResponse.json(
        { error: 'Issue has no associated team' },
        { status: 500 }
      );
    }

    // Format response to match LinearIssue type
    const formattedIssue: LinearIssue = {
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description || null,
      state: state
        ? {
            id: state.id,
            name: state.name,
            type: state.type as 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled',
            color: state.color,
          }
        : {
            id: '',
            name: 'Unknown',
            type: 'unstarted' as const,
            color: '#000000',
          },
      priority: issue.priority,
      assignee: assignee
        ? {
            id: assignee.id,
            name: assignee.name,
            email: assignee.email,
            avatarUrl: assignee.avatarUrl || undefined,
          }
        : undefined,
      labels: labels.nodes.map((label) => ({
        id: label.id,
        name: label.name,
        color: label.color,
      })),
      project: {
        id: project.id,
        name: project.name,
        icon: project.icon || undefined,
      },
      team: {
        id: team.id,
        name: team.name,
        key: team.key,
      },
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      url: issue.url,
    };

    return NextResponse.json(formattedIssue);
  } catch (error) {
    console.error('[API] Error fetching issue:', error);

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
      { error: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}
