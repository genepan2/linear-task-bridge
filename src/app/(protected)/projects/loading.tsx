/**
 * Loading state for projects page
 * Displays skeleton UI while projects are being fetched
 */
export default function ProjectsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
              <div className="flex-1">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
