import { ApiError } from './api-client';

/**
 * Error handling utilities
 * Provides consistent error formatting and user-friendly messages
 */

export interface ErrorResponse {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

/**
 * Format error for user display
 * Removes sensitive information and provides friendly messages
 */
export function formatError(error: unknown): ErrorResponse {
  // API errors
  if (error instanceof ApiError) {
    return {
      message: getUserFriendlyMessage(error.status, error.message),
      code: `API_${error.status}`,
      status: error.status,
    };
  }

  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      message: 'Unable to connect to the server. Please check your internet connection.',
      code: 'NETWORK_ERROR',
    };
  }

  // Generic errors
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  // Unknown errors
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Get user-friendly error message based on status code
 */
function getUserFriendlyMessage(status: number, defaultMessage: string): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input and try again.',
    401: 'You need to sign in to access this resource.',
    403: 'You don\'t have permission to access this resource.',
    404: 'The requested resource was not found.',
    408: 'The request timed out. Please try again.',
    409: 'This action conflicts with existing data.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'A server error occurred. Please try again later.',
    502: 'Bad gateway. The server is temporarily unavailable.',
    503: 'Service temporarily unavailable. Please try again later.',
    504: 'Gateway timeout. The request took too long.',
  };

  return messages[status] || defaultMessage || 'An error occurred. Please try again.';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes('fetch');
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 400;
}

/**
 * Log error to monitoring service
 * In production, this would send to Sentry, LogRocket, etc.
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
  }

  // In production, send to monitoring service
  // Example: Sentry.captureException(error, { extra: context });
}

/**
 * Retry failed request with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on auth or validation errors
      if (isAuthError(error) || isValidationError(error)) {
        throw error;
      }

      // Last retry failed
      if (i === maxRetries - 1) {
        throw error;
      }

      // Wait with exponential backoff
      const delay = baseDelay * Math.pow(2, i);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
