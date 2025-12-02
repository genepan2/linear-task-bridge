/**
 * Issues List Page - Client Component
 * Uses project context to display issues for current project
 */
'use client';

import { IssueListClient } from '@/components/issues/IssueListClient';
import { useProjectContext } from '@/lib/project-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function IssuesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    currentProject,
    currentProjectId,
    allProjects,
    setCurrentProject,
    isLoading,
    hasProjects
  } = useProjectContext();

  // Handle projectId from URL query params
  useEffect(() => {
    const urlProjectId = searchParams.get('projectId');
    if (urlProjectId && urlProjectId !== currentProjectId) {
      setCurrentProject(urlProjectId);
    }
  }, [searchParams, currentProjectId, setCurrentProject]);

  // Redirect to project selector if no current project and has multiple projects
  useEffect(() => {
    if (!isLoading && hasProjects && !currentProjectId && allProjects.length > 1) {
      router.push('/projects');
    }
  }, [isLoading, hasProjects, currentProjectId, allProjects.length, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  // No projects assigned
  if (!hasProjects) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          No Projects Assigned
        </h1>
        <p className="text-gray-600">
          You don&apos;t have access to any projects yet. Please contact your administrator.
        </p>
      </div>
    );
  }

  // No current project selected (shouldn't happen after redirect)
  if (!currentProject || !currentProjectId) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          No Project Selected
        </h1>
        <p className="text-gray-600 mb-6">
          Please select a project to view its issues.
        </p>
        <Button onClick={() => router.push('/projects')}>
          Select Project
        </Button>
      </div>
    );
  }

  // Render issue list for current project
  return (
    <IssueListClient
      projectId={currentProjectId}
      projectName={currentProject.name}
    />
  );
}
