'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { useProjectContext } from '@/lib/project-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * Projects Page
 * Allows users to select a project to work with
 * Features:
 * - PROJECT-1: Switch between multiple projects
 * - PROJECT-2: Only see assigned projects
 * - PROJECT-3: Auto-redirect if single project
 */
export default function ProjectsPage() {
  const router = useRouter();
  const {
    allProjects,
    currentProjectId,
    setCurrentProject,
    isLoading,
    hasMultipleProjects
  } = useProjectContext();

  // Auto-redirect to issues if user has only one project
  useEffect(() => {
    if (!isLoading && !hasMultipleProjects && allProjects.length === 1 && allProjects[0]) {
      setCurrentProject(allProjects[0].id);
      router.push('/issues');
    }
  }, [isLoading, hasMultipleProjects, allProjects, setCurrentProject, router]);

  const handleProjectClick = (projectId: string) => {
    setCurrentProject(projectId);
    router.push('/issues');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          {currentProjectId && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/issues')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Issues
            </Button>
          )}
        </div>

        <h1 className="text-4xl font-bold tracking-tight">Select a Project</h1>
        <p className="text-muted-foreground mt-2">
          Choose a project to view and manage its issues
        </p>
      </div>

      {/* Project Grid */}
      <ProjectGrid
        projects={allProjects}
        isLoading={isLoading}
        onProjectClick={handleProjectClick}
        selectedProjectId={currentProjectId}
      />

      {/* Help Text */}
      {!isLoading && allProjects.length > 0 && (
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Click on a project card to view its issues.
            You can switch between projects at any time using the dropdown in the header.
          </p>
        </div>
      )}
    </div>
  );
}
