import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a new QueryClient instance with optimized defaults
 * - staleTime: 30 seconds (reduces unnecessary refetches)
 * - retry: 1 (avoids excessive retries)
 * - refetchOnWindowFocus: true (keeps data fresh when user returns)
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30000, // 30 seconds
        retry: 1,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: false, // Don't retry mutations by default
      },
    },
  });
}

// Browser-only query client instance
let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return makeQueryClient();
  } else {
    // Browser: reuse existing client
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
