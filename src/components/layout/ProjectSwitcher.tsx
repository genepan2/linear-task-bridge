'use client';

import { useProjectContext } from '@/lib/project-context';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Project Switcher Component
 * Dropdown in header to switch between projects
 * Hidden if user has only one project (PROJECT-3)
 */
export function ProjectSwitcher() {
  const router = useRouter();
  const {
    currentProject,
    allProjects,
    setCurrentProject,
    hasMultipleProjects,
    isLoading
  } = useProjectContext();

  // Hide if only one project (PROJECT-3)
  if (!hasMultipleProjects && !isLoading) {
    return null;
  }

  // Show skeleton during loading
  if (isLoading) {
    return (
      <Skeleton className="w-[200px] h-10" />
    );
  }

  // Handle project selection
  const handleProjectSwitch = (projectId: string) => {
    setCurrentProject(projectId);
    // Redirect to issues page with new project context
    router.push('/issues');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          <div className="flex items-center gap-2 truncate">
            {currentProject?.icon && (
              <span className="text-lg">{currentProject.icon}</span>
            )}
            <span className="truncate">
              {currentProject?.name || 'Select Project'}
            </span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Switch Project</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {allProjects.map((project) => (
          <DropdownMenuItem
            key={project.id}
            onClick={() => handleProjectSwitch(project.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 truncate">
              {project.icon && (
                <span className="text-base">{project.icon}</span>
              )}
              <span className="truncate">{project.name}</span>
            </div>
            {currentProject?.id === project.id && (
              <Check className="h-4 w-4 ml-2 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
