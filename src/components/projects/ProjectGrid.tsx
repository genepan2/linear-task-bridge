'use client';

import { ProjectCard } from './ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectsEmptyState } from '@/components/ui/empty-states';

interface Project {
  id: string;
  name: string;
  key: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface ProjectGridProps {
  projects: Project[];
  isLoading?: boolean;
  onProjectClick?: (projectId: string) => void;
  selectedProjectId?: string | null;
}

/**
 * Project Grid Component
 * Displays projects in a responsive grid layout
 * Handles loading and empty states
 */
export function ProjectGrid({
  projects,
  isLoading = false,
  onProjectClick,
  selectedProjectId
}: ProjectGridProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!projects.length) {
    return <ProjectsEmptyState />;
  }

  // Project grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onClick={() => onProjectClick?.(project.id)}
          isSelected={project.id === selectedProjectId}
        />
      ))}
    </div>
  );
}

/**
 * Loading skeleton for project card
 */
function ProjectCardSkeleton() {
  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}
