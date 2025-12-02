/**
 * Reusable skeleton components for loading states
 */

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 rounded animate-pulse ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function IssueCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-2">
        <Skeleton className="w-8 h-8 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </div>
      </div>
    </div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-12 h-12 rounded" />
        <div className="flex-1">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
