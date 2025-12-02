'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';

/**
 * Project Context Type
 */
interface ProjectContextType {
  currentProject: {
    id: string;
    name: string;
    key: string;
    description?: string;
    icon?: string;
    color?: string;
  } | undefined;
  currentProjectId: string | null;
  setCurrentProject: (projectId: string) => void;
  clearCurrentProject: () => void;
  allProjects: Array<{
    id: string;
    name: string;
    key: string;
    description?: string;
    icon?: string;
    color?: string;
  }>;
  isLoading: boolean;
  error: Error | null;
  hasMultipleProjects: boolean;
  hasProjects: boolean;
}

/**
 * Project Context
 */
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

/**
 * Project Provider Props
 */
interface ProjectProviderProps {
  children: ReactNode;
}

/**
 * Project Provider Component
 * Wraps protected routes to provide project context
 */
export function ProjectProvider({ children }: ProjectProviderProps) {
  const projectState = useCurrentProject();

  return (
    <ProjectContext.Provider value={projectState}>
      {children}
    </ProjectContext.Provider>
  );
}

/**
 * Hook to use Project Context
 * @throws Error if used outside ProjectProvider
 */
export function useProjectContext() {
  const context = useContext(ProjectContext);

  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }

  return context;
}
