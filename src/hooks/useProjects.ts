import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

/**
 * Fetch all projects
 * @returns Query result with projects list
 */
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: api.projects.list,
  });
}

/**
 * Get the current/default project (first project)
 * Useful for single-project workflows
 * @returns Query result with current project
 */
export function useCurrentProject() {
  const { data, ...rest } = useProjects();

  return {
    ...rest,
    data: data?.projects[0],
  };
}
