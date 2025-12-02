import { NextResponse } from 'next/server';
import { requireAuth, getUserMetadata } from '@/lib/auth';
import { linearClient } from '@/lib/linear';
import type { GetProjectsResponse } from '@/types/api';
import type { LinearProject } from '@/types/linear';

/**
 * GET /api/projects
 *
 * Returns list of projects the current user can access.
 * Projects are filtered based on user's allowedProjects metadata.
 *
 * @returns {GetProjectsResponse} List of accessible projects
 */
export async function GET() {
  try {
    // Validate authentication
    await requireAuth();

    // Get user's allowed project IDs
    const metadata = await getUserMetadata();
    const allowedProjectIds = metadata.allowedProjects;

    // If user has no allowed projects, return empty list
    if (!allowedProjectIds || allowedProjectIds.length === 0) {
      return NextResponse.json<GetProjectsResponse>(
        {
          projects: [],
          total: 0,
        },
        { status: 200 }
      );
    }

    // Fetch project details from Linear for each allowed project
    const projectPromises = allowedProjectIds.map(async (projectId: string) => {
      try {
        const project = await linearClient.project(projectId);

        // Get teams connection and extract first team
        const teamsConnection = await project.teams();
        const team = teamsConnection.nodes[0];

        if (!team) {
          console.error(`Project ${projectId} has no associated team`);
          return null;
        }

        // Get lead if it exists
        const lead = await project.lead;

        // Transform Linear project to our format
        // Note: issueCount/completedIssueCount omitted for performance
        // Fetching all issues just to count is too slow
        const linearProject: LinearProject = {
          id: project.id,
          name: project.name,
          icon: project.icon || undefined,
          description: project.description || undefined,
          color: project.color || undefined,
          state: project.state as LinearProject['state'],
          team: {
            id: team.id,
            name: team.name,
            key: team.key,
          },
          lead: lead
            ? {
                id: lead.id,
                name: lead.name,
                avatarUrl: lead.avatarUrl || undefined,
              }
            : undefined,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          url: project.url,
        };

        return linearProject;
      } catch (error) {
        // Log error but don't fail entire request if one project fails
        console.error(`Failed to fetch project ${projectId}:`, error);
        return null;
      }
    });

    // Wait for all project fetches to complete
    const projectResults = await Promise.all(projectPromises);

    // Filter out null results (failed fetches)
    const projects = projectResults.filter(
      (project: LinearProject | null): project is LinearProject => project !== null
    );

    // Return filtered projects
    return NextResponse.json<GetProjectsResponse>(
      {
        projects,
        total: projects.length,
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle authentication errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
          status: 401,
          timestamp: Date.now(),
        },
        { status: 401 }
      );
    }

    // Handle other errors
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch projects',
        code: 'INTERNAL_ERROR',
        status: 500,
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
