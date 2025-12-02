/**
 * Linear API Error Handling
 *
 * Custom error classes and error handling utilities for Linear SDK integration.
 */

/**
 * Base error class for Linear API errors
 */
export class LinearAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'LinearAPIError';
    Object.setPrototypeOf(this, LinearAPIError.prototype);
  }
}

/**
 * Error thrown when Linear API authentication fails
 */
export class LinearAuthenticationError extends LinearAPIError {
  constructor(message: string = 'Linear API authentication failed') {
    super(message, 'AUTHENTICATION_FAILED', 401);
    this.name = 'LinearAuthenticationError';
    Object.setPrototypeOf(this, LinearAuthenticationError.prototype);
  }
}

/**
 * Error thrown when a resource is not found
 */
export class LinearNotFoundError extends LinearAPIError {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND', 404, { resource, id });
    this.name = 'LinearNotFoundError';
    Object.setPrototypeOf(this, LinearNotFoundError.prototype);
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class LinearRateLimitError extends LinearAPIError {
  constructor(
    public retryAfter?: number,
    message: string = 'Linear API rate limit exceeded'
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
    this.name = 'LinearRateLimitError';
    Object.setPrototypeOf(this, LinearRateLimitError.prototype);
  }
}

/**
 * Error thrown when validation fails
 */
export class LinearValidationError extends LinearAPIError {
  constructor(
    message: string,
    public validationErrors?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_FAILED', 400, { validationErrors });
    this.name = 'LinearValidationError';
    Object.setPrototypeOf(this, LinearValidationError.prototype);
  }
}

/**
 * Error thrown when user lacks permissions
 */
export class LinearPermissionError extends LinearAPIError {
  constructor(message: string = 'Insufficient permissions for this operation') {
    super(message, 'PERMISSION_DENIED', 403);
    this.name = 'LinearPermissionError';
    Object.setPrototypeOf(this, LinearPermissionError.prototype);
  }
}

/**
 * Error thrown when network request fails
 */
export class LinearNetworkError extends LinearAPIError {
  constructor(message: string = 'Network request to Linear API failed') {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'LinearNetworkError';
    Object.setPrototypeOf(this, LinearNetworkError.prototype);
  }
}

/**
 * Error response type from Linear GraphQL API
 */
interface LinearGraphQLError {
  message: string;
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}

/**
 * Parse and handle Linear SDK errors
 *
 * @param error - Error from Linear SDK
 * @param context - Additional context for the error
 * @returns Typed LinearAPIError
 */
export function handleLinearError(error: unknown, context?: string): LinearAPIError {
  const prefix = context ? `${context}: ` : '';

  // Handle standard Error objects
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Check for authentication errors
    if (message.includes('authentication') || message.includes('unauthorized')) {
      return new LinearAuthenticationError(prefix + error.message);
    }

    // Check for not found errors
    if (message.includes('not found')) {
      const match = message.match(/(\w+)\s+not found:?\s*(.+)?/i);
      if (match && match[1]) {
        return new LinearNotFoundError(match[1], match[2] ?? '');
      }
      return new LinearNotFoundError('Resource', '');
    }

    // Check for rate limit errors
    if (message.includes('rate limit')) {
      return new LinearRateLimitError(undefined, prefix + error.message);
    }

    // Check for validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return new LinearValidationError(prefix + error.message);
    }

    // Check for permission errors
    if (message.includes('permission') || message.includes('forbidden')) {
      return new LinearPermissionError(prefix + error.message);
    }

    // Check for network errors
    if (message.includes('network') || message.includes('fetch')) {
      return new LinearNetworkError(prefix + error.message);
    }

    // Generic API error
    return new LinearAPIError(prefix + error.message);
  }

  // Handle GraphQL errors
  if (typeof error === 'object' && error !== null && 'errors' in error) {
    const errors = error.errors as LinearGraphQLError[];
    if (Array.isArray(errors) && errors.length > 0) {
      const firstError = errors[0];
      if (!firstError) return new LinearAPIError(prefix + 'Unknown GraphQL error');
      const code = firstError.extensions?.code;
      const message = prefix + firstError.message;

      switch (code) {
        case 'UNAUTHENTICATED':
          return new LinearAuthenticationError(message);
        case 'FORBIDDEN':
          return new LinearPermissionError(message);
        case 'NOT_FOUND':
          return new LinearNotFoundError('Resource', '');
        case 'BAD_USER_INPUT':
          return new LinearValidationError(message);
        default:
          return new LinearAPIError(message, code);
      }
    }
  }

  // Unknown error type
  return new LinearAPIError(prefix + 'An unknown error occurred', 'UNKNOWN_ERROR');
}

/**
 * Check if error is a Linear API error
 *
 * @param error - Error to check
 * @returns True if error is a LinearAPIError
 */
export function isLinearAPIError(error: unknown): error is LinearAPIError {
  return error instanceof LinearAPIError;
}

/**
 * Check if error is a Linear authentication error
 *
 * @param error - Error to check
 * @returns True if error is a LinearAuthenticationError
 */
export function isLinearAuthenticationError(
  error: unknown
): error is LinearAuthenticationError {
  return error instanceof LinearAuthenticationError;
}

/**
 * Check if error is a Linear not found error
 *
 * @param error - Error to check
 * @returns True if error is a LinearNotFoundError
 */
export function isLinearNotFoundError(error: unknown): error is LinearNotFoundError {
  return error instanceof LinearNotFoundError;
}

/**
 * Check if error is a Linear rate limit error
 *
 * @param error - Error to check
 * @returns True if error is a LinearRateLimitError
 */
export function isLinearRateLimitError(error: unknown): error is LinearRateLimitError {
  return error instanceof LinearRateLimitError;
}

/**
 * Check if error is a Linear validation error
 *
 * @param error - Error to check
 * @returns True if error is a LinearValidationError
 */
export function isLinearValidationError(error: unknown): error is LinearValidationError {
  return error instanceof LinearValidationError;
}

/**
 * Check if error is a Linear permission error
 *
 * @param error - Error to check
 * @returns True if error is a LinearPermissionError
 */
export function isLinearPermissionError(error: unknown): error is LinearPermissionError {
  return error instanceof LinearPermissionError;
}

/**
 * Check if error is a Linear network error
 *
 * @param error - Error to check
 * @returns True if error is a LinearNetworkError
 */
export function isLinearNetworkError(error: unknown): error is LinearNetworkError {
  return error instanceof LinearNetworkError;
}

/**
 * Format error for user display
 *
 * @param error - Error to format
 * @returns User-friendly error message
 */
export function formatErrorForUser(error: unknown): string {
  if (isLinearAuthenticationError(error)) {
    return 'Authentication failed. Please check your Linear API key.';
  }

  if (isLinearNotFoundError(error)) {
    return 'The requested resource was not found.';
  }

  if (isLinearRateLimitError(error)) {
    const retryMessage = error.retryAfter
      ? ` Please try again in ${error.retryAfter} seconds.`
      : ' Please try again later.';
    return 'Rate limit exceeded.' + retryMessage;
  }

  if (isLinearValidationError(error)) {
    return 'Validation error: ' + error.message;
  }

  if (isLinearPermissionError(error)) {
    return 'You do not have permission to perform this action.';
  }

  if (isLinearNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }

  if (isLinearAPIError(error)) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
