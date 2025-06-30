/**
 * Custom API Error class
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: any;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    status: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Handle and normalize API errors
 */
export function handleApiError(error: any): ApiError {
  // Already an ApiError
  if (error instanceof ApiError) {
    return error;
  }

  // Supabase error
  if (error?.message && error?.code) {
    return new ApiError(
      error.message,
      error.code,
      error.status || 400,
      error.details
    );
  }

  // Axios error
  if (error?.response) {
    const { status, data } = error.response || {};
    return new ApiError(
      data?.message || data?.error || 'Request failed',
      data?.code || 'HTTP_ERROR',
      status || 500,
      data
    );
  }

  // Network error
  if (error?.request) {
    return new ApiError(
      'Network error - please check your connection',
      'NETWORK_ERROR',
      0
    );
  }

  // Generic error
  return new ApiError(
    error?.message || 'An unexpected error occurred',
    'UNKNOWN_ERROR',
    500,
    error
  );
}

/**
 * Error codes enum
 */
export const ErrorCodes = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // Business Logic
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  
  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // External Services
  PAYMENT_PROVIDER_ERROR: 'PAYMENT_PROVIDER_ERROR',
  EVO_AI_ERROR: 'EVO_AI_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];