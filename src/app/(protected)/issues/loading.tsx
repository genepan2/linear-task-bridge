/**
 * Loading state for issues list page
 * Displays skeleton UI while data is being fetched
 */
export default function IssuesLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="mb-6 flex gap-4">
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
