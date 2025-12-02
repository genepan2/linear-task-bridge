import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook to manage current project selection
 * Handles persistence via localStorage and URL params
 * Auto-selects if user has only one project
 */
export function useCurrentProject() {
  const [currentProjectId, setCurrentProjectIdState] = useState<string | null>(null);

  // Fetch all available projects
  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: api.projects.list,
  });

  const projects = useMemo(() => projectsData?.projects || [], [projectsData?.projects]);
  const currentProject = projects.find(p => p.id === currentProjectId);

  // Initialize current project from localStorage or URL or auto-select
  useEffect(() => {
    if (isLoading || !projects.length) return;

    // Try to get from URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const urlProjectId = urlParams.get('projectId');

    // Try to get from localStorage
    const storedProjectId = localStorage.getItem('taskbridge:currentProjectId');

    // Priority: URL > localStorage > first project (if only one) > null
    let projectId: string | null = null;

    if (urlProjectId && projects.some(p => p.id === urlProjectId)) {
      projectId = urlProjectId;
    } else if (storedProjectId && projects.some(p => p.id === storedProjectId)) {
      projectId = storedProjectId;
    } else if (projects.length === 1 && projects[0]) {
      // Auto-select if user has only one project
      projectId = projects[0].id;
    }

    if (projectId) {
      setCurrentProjectIdState(projectId);
      localStorage.setItem('taskbridge:currentProjectId', projectId);
    }
  }, [projects, isLoading]);

  // Function to set current project
  const setCurrentProject = useCallback((projectId: string) => {
    // Validate that user has access to this project
    if (!projects.some(p => p.id === projectId)) {
      console.error('Attempted to set invalid project ID:', projectId);
      return;
    }

    setCurrentProjectIdState(projectId);
    localStorage.setItem('taskbridge:currentProjectId', projectId);

    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set('projectId', projectId);
    window.history.replaceState({}, '', url.toString());
  }, [projects]);

  // Clear current project
  const clearCurrentProject = useCallback(() => {
    setCurrentProjectIdState(null);
    localStorage.removeItem('taskbridge:currentProjectId');

    const url = new URL(window.location.href);
    url.searchParams.delete('projectId');
    window.history.replaceState({}, '', url.toString());
  }, []);

  return {
    currentProject,
    currentProjectId,
    setCurrentProject,
    clearCurrentProject,
    allProjects: projects,
    isLoading,
    error,
    hasMultipleProjects: projects.length > 1,
    hasProjects: projects.length > 0,
  };
}
