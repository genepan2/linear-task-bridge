/**
 * Type-safe API client for Task Bridge
 * Provides typed fetch wrappers for all API endpoints
 */

// Response types
export interface ProjectsResponse {
  projects: Array<{
    id: string;
    name: string;
    key: string;
    description?: string;
    icon?: string;
    color?: string;
  }>;
}

export interface IssuesResponse {
  issues: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
    assigneeId?: string;
    labels?: string[];
  }>;
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface IssueResponse {
  issue: {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
    assigneeId?: string;
    labels?: string[];
  };
}

export interface CommentsResponse {
  comments: Array<{
    id: string;
    body: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    };
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface CommentResponse {
  comment: {
    id: string;
    body: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    };
    createdAt: string;
    updatedAt: string;
  };
}

export interface CreateIssueData {
  title: string;
  description?: string;
  status: string;
  priority: string;
  projectId: string;
  assigneeId?: string;
  labels?: string[];
}

export interface CreateCommentData {
  body: string;
}

export interface IssueFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Type-safe fetch wrapper with error handling
 */
export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `API Error: ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

/**
 * Organized API client with typed endpoints
 */
export const api = {
  projects: {
    list: () => fetchApi<ProjectsResponse>('/api/projects'),
  },

  issues: {
    list: (projectId: string, filters?: IssueFilters) => {
      const params = new URLSearchParams({ projectId });
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assigneeId) params.append('assigneeId', filters.assigneeId);
      if (filters?.search) params.append('search', filters.search);

      return fetchApi<IssuesResponse>(`/api/issues?${params.toString()}`);
    },

    get: (issueId: string) =>
      fetchApi<IssueResponse>(`/api/issues/${issueId}`),

    create: (data: CreateIssueData) =>
      fetchApi<IssueResponse>('/api/issues', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (issueId: string, data: Partial<CreateIssueData>) =>
      fetchApi<IssueResponse>(`/api/issues/${issueId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (issueId: string) =>
      fetchApi<void>(`/api/issues/${issueId}`, {
        method: 'DELETE',
      }),
  },

  comments: {
    list: (issueId: string) =>
      fetchApi<CommentsResponse>(`/api/issues/${issueId}/comments`),

    create: (issueId: string, body: CreateCommentData) =>
      fetchApi<CommentResponse>(`/api/issues/${issueId}/comments`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    delete: (issueId: string, commentId: string) =>
      fetchApi<void>(`/api/issues/${issueId}/comments/${commentId}`, {
        method: 'DELETE',
      }),
  },
};
