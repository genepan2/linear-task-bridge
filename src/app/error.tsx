'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the application
 * Catches unhandled errors and provides recovery options
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. This has been logged and we&apos;ll look into it.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left mb-6 p-4 bg-gray-100 rounded-lg">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Error details
              </summary>
              <pre className="text-xs text-gray-600 overflow-auto">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="block w-full px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
