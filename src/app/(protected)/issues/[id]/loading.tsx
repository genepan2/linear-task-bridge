/**
 * Loading state for issue detail page
 * Displays skeleton UI while issue data is being fetched
 */
export default function IssueDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="flex gap-4 mb-4">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
