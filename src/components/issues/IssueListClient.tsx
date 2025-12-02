/**
 * IssueListClient - Client component for issue list with filters and real-time updates
 */
'use client';

import { useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { RefreshCw, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IssueCard } from './IssueCard';
import { IssueFilters } from './IssueFilters';
import { useIssues, useWorkflowStates } from '@/hooks/use-issues';
import type { IssueFilters as IssueFiltersType, LinearIssue } from '@/types/linear';
import Link from 'next/link';
import { IssuesEmptyState } from '@/components/ui/empty-states';

interface IssueListClientProps {
  projectId: string;
  projectName: string;
}

export function IssueListClient({ projectId, projectName }: IssueListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse filters from URL
  const filters: IssueFiltersType = {
    status: searchParams.get('status') || undefined,
    search: searchParams.get('search') || undefined,
    sort: (searchParams.get('sort') as IssueFiltersType['sort']) || undefined,
    order: (searchParams.get('order') as IssueFiltersType['order']) || undefined,
  };

  // Fetch data
  const { data, isLoading, error, refresh, isFetching } = useIssues({
    projectId,
    filters,
  });

  const { data: workflowStates = [], isLoading: isLoadingStates } = useWorkflowStates(projectId);

  // Update URL when filters change
  const handleFiltersChange = useCallback((newFilters: IssueFiltersType) => {
    const params = new URLSearchParams();

    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.sort) params.set('sort', newFilters.sort);
    if (newFilters.order) params.set('order', newFilters.order);

    const queryString = params.toString();
    router.push(`/issues${queryString ? `?${queryString}` : ''}`, { scroll: false });
  }, [router]);

  const issues = data?.issues || [];
  const hasActiveFilters = filters.status || filters.search || filters.sort;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issues</h1>
          <p className="text-gray-600 mt-1">{projectName}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isFetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/issues/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Issue
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <IssueFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          workflowStates={workflowStates}
          isLoading={isLoadingStates}
        />
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load issues: {error.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue List */}
      {!isLoading && !error && (
        <>
          {issues.length > 0 ? (
            <div className="space-y-3">
              {/* Results count */}
              <div className="text-sm text-gray-600 mb-4">
                {issues.length} {issues.length === 1 ? 'issue' : 'issues'} found
                {hasActiveFilters && ' (filtered)'}
              </div>

              {/* Issue cards */}
              {issues.map((issue: LinearIssue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}

              {/* Pagination placeholder - can be implemented later */}
              {data?.pageInfo?.hasNextPage && (
                <div className="text-center pt-6">
                  <Button variant="outline" size="sm">
                    Load more
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Empty State
            <div className="border-2 border-dashed border-gray-300 rounded-lg">
              <IssuesEmptyState
                hasFilters={!!hasActiveFilters}
                onCreateIssue={() => router.push('/issues/new')}
                onClearFilters={() => handleFiltersChange({})}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
