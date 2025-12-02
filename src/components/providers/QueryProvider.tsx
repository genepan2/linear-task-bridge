'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider wraps the application with TanStack Query
 * Provides caching, refetching, and state management for server data
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
