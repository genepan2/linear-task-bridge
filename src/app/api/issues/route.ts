import { NextRequest, NextResponse } from 'next/server';
import { linearClient, LINEAR_CONFIG } from '@/lib/linear';
import {
  requireAuth,
  validateProjectAccess,
  getUserLinearLabelId,
  getCurrentUserDisplayName,
} from '@/lib/auth';
import { createIssueSchema } from '@/lib/validations';
import type { LinearIssue } from '@/types/linear';

/**
 * GET /api/issues
 *
 * List issues for a project with optional filtering
 * Query params:
 * - projectId: Required Linear project ID
 * - status: Optional status filter
 * - search: Optional search query
 * - priority: Optional priority filter
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    await requireAuth();

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const priority = searchParams.get('priority');

    // Validate required parameters
    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Validate user has access to this project
    const hasAccess = await validateProjectAccess(projectId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this project' },
        { status: 403 }
      );
    }

    // Build filter object for Linear query
    const filter: Record<string, any> = {
      project: { id: { eq: projectId } },
      state: { type: { neq: 'canceled' } }, // Exclude canceled issues
    };

    // Apply optional filters
    if (status) {
      filter.state = { ...filter.state, type: { eq: status } };
    }

    if (priority) {
      const priorityNum = parseInt(priority, 10);
      if (!isNaN(priorityNum) && priorityNum >= 0 && priorityNum <= 4) {
        filter.priority = { eq: priorityNum };
      }
    }

    if (search) {
      // Linear SDK supports text search in title and description
      filter.or = [
        { title: { containsIgnoreCase: search } },
        { description: { containsIgnoreCase: search } },
      ];
    }

    // Query Linear API
    const issuesResponse = await linearClient.issues({
      filter,
      first: 100, // Limit to 100 issues per request
    });

    // Transform issues to our format
    const issues: LinearIssue[] = [];

    for await (const issue of issuesResponse.nodes) {
      const state = await issue.state;
      const assignee = await issue.assignee;
      const labels = await issue.labels();
      const project = await issue.project;
      const team = await issue.team;

      // Skip issues without a team (should not happen, but be safe)
      if (!team) {
        console.warn(`Issue ${issue.id} has no team, skipping`);
        continue;
      }

      issues.push({
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
              type: 'backlog' as const,
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
        project: project
          ? {
              id: project.id,
              name: project.name,
              icon: project.icon || undefined,
            }
          : undefined,
        team: {
          id: team.id,
          name: team.name,
          key: team.key,
        },
        createdAt: issue.createdAt.toISOString(),
        updatedAt: issue.updatedAt.toISOString(),
        url: issue.url,
      });
    }

    return NextResponse.json({ issues }, { status: 200 });
  } catch (error) {
    console.error('Error fetching issues:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/issues
 *
 * Create a new issue in Linear
 * Body:
 * - projectId: Required Linear project ID
 * - title: Required issue title
 * - description: Required issue description
 * - priority: Optional priority (0-4)
 * - type: Optional type (bug/feature/task)
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    await requireAuth();

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = createIssueSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validation.error.flatten().fieldErrors
        },
        { status: 400 }
      );
    }

    const { projectId, title, description, priority } = validation.data;

    // Validate user has access to this project
    const hasAccess = await validateProjectAccess(projectId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this project' },
        { status: 403 }
      );
    }

    // Get the project to retrieve teamId
    const project = await linearClient.project(projectId);
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get teams connection and extract first team
    const teamsConnection = await project.teams();
    const team = teamsConnection.nodes[0];

    if (!team) {
      return NextResponse.json(
        { error: 'Project has no associated team' },
        { status: 400 }
      );
    }

    // Build label IDs array
    const labelIds: string[] = [];

    // Add global client-submitted label
    if (LINEAR_CONFIG.clientLabelId) {
      labelIds.push(LINEAR_CONFIG.clientLabelId);
    }

    // Add user-specific label
    const userLabelId = await getUserLinearLabelId();
    if (userLabelId) {
      labelIds.push(userLabelId);
    }

    // Get user display name for attribution
    const userDisplayName = await getCurrentUserDisplayName();

    // Enhance description with attribution
    const enhancedDescription = `${description}\n\n---\n_Submitted by: ${userDisplayName}_`;

    // Create issue in Linear
    const issuePayload = await linearClient.createIssue({
      teamId: team.id,
      projectId,
      title,
      description: enhancedDescription,
      priority: priority ?? undefined,
      labelIds: labelIds.length > 0 ? labelIds : undefined,
    });

    // Wait for the issue to be created
    const createdIssue = await issuePayload.issue;

    if (!createdIssue) {
      return NextResponse.json(
        { error: 'Failed to create issue' },
        { status: 500 }
      );
    }

    // Fetch full issue details
    const issue = await linearClient.issue(createdIssue.id);
    const state = await issue.state;
    const assignee = await issue.assignee;
    const labels = await issue.labels();
    const issueProject = await issue.project;
    const issueTeam = await issue.team;

    // Validate issue has required team
    if (!issueTeam) {
      return NextResponse.json(
        { error: 'Created issue has no associated team' },
        { status: 500 }
      );
    }

    // Transform to our format
    const responseIssue: LinearIssue = {
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
            type: 'backlog' as const,
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
      project: issueProject
        ? {
            id: issueProject.id,
            name: issueProject.name,
            icon: issueProject.icon || undefined,
          }
        : undefined,
      team: {
        id: issueTeam.id,
        name: issueTeam.name,
        key: issueTeam.key,
      },
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      url: issue.url,
    };

    return NextResponse.json(
      { issue: responseIssue },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating issue:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}
