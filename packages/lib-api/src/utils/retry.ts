import { sentryService } from './sentry';

export interface RetryConfig {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryCondition?: (error: Error | unknown) => boolean;
  onRetry?: (error: Error | unknown, attempt: number) => void;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2,
  retryCondition: (error: Error | unknown) => {
    // Retry on network errors, timeouts, and 5xx server errors
    if ((error as any)?.code === 'NETWORK_ERROR' || (error as any)?.code === 'TIMEOUT') {
      return true;
    }
    
    if ((error as any)?.status >= 500 && (error as any)?.status < 600) {
      return true;
    }
    
    // Retry on specific Supabase errors
    if ((error as any)?.message?.includes('connection') || (error as any)?.message?.includes('timeout')) {
      return true;
    }
    
    return false;
  },
  onRetry: (error: Error | unknown, attempt: number) => {
    console.warn(`Retrying operation (attempt ${attempt}):`, (error as any).message);
    sentryService.addBreadcrumb({
      message: `Retry attempt ${attempt}`,
      category: 'retry',
      level: 'warning',
      data: {
        error: (error as any).message,
        attempt,
      },
    });
  },
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: any;
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      const result = await operation();
      
      // Log successful retry if this wasn't the first attempt
      if (attempt > 1) {
        sentryService.addBreadcrumb({
          message: `Operation succeeded after ${attempt} attempts`,
          category: 'retry',
          level: 'info',
          data: { attempt },
        });
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt
      if (attempt === finalConfig.maxAttempts) {
        break;
      }
      
      // Check if we should retry this error
      if (!finalConfig.retryCondition(error)) {
        break;
      }
      
      // Call retry callback
      finalConfig.onRetry(error, attempt);
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffFactor, attempt - 1),
        finalConfig.maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;
      
      await sleep(jitteredDelay);
    }
  }
  
  // Log final failure
  sentryService.captureException(lastError, {
    retryAttempts: finalConfig.maxAttempts,
    finalError: true,
  });
  
  throw lastError;
}

export function withRetrySync<T>(
  operation: () => T,
  config: Omit<RetryConfig, 'onRetry'> & {
    onRetry?: (error: any, attempt: number) => void;
  } = {}
): T {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: any;
  
  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt
      if (attempt === finalConfig.maxAttempts) {
        break;
      }
      
      // Check if we should retry this error
      if (!finalConfig.retryCondition(error)) {
        break;
      }
      
      // Call retry callback
      if (finalConfig.onRetry) {
        finalConfig.onRetry(error, attempt);
      }
    }
  }
  
  throw lastError;
}

export class RetryableOperation<T> {
  private config: Required<RetryConfig>;
  private operation: () => Promise<T>;
  
  constructor(operation: () => Promise<T>, config: RetryConfig = {}) {
    this.operation = operation;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  async execute(): Promise<T> {
    return withRetry(this.operation, this.config);
  }
  
  withConfig(config: Partial<RetryConfig>): RetryableOperation<T> {
    return new RetryableOperation(this.operation, { ...this.config, ...config });
  }
  
  withMaxAttempts(maxAttempts: number): RetryableOperation<T> {
    return this.withConfig({ maxAttempts });
  }
  
  withDelay(baseDelay: number, maxDelay?: number): RetryableOperation<T> {
    return this.withConfig({ baseDelay, maxDelay });
  }
  
  withCondition(retryCondition: (error: any) => boolean): RetryableOperation<T> {
    return this.withConfig({ retryCondition });
  }
}

export function retryable<T>(operation: () => Promise<T>, config?: RetryConfig): RetryableOperation<T> {
  return new RetryableOperation(operation, config);
}

// Utility function for sleep
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Predefined retry configurations
export const RETRY_CONFIGS = {
  // Quick operations (API calls, database queries)
  QUICK: {
    maxAttempts: 3,
    baseDelay: 500,
    maxDelay: 5000,
    backoffFactor: 2,
  },
  
  // Standard operations
  STANDARD: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  },
  
  // Long operations (file uploads, heavy processing)
  LONG: {
    maxAttempts: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffFactor: 1.5,
  },
  
  // Critical operations (payments, important data)
  CRITICAL: {
    maxAttempts: 5,
    baseDelay: 1000,
    maxDelay: 60000,
    backoffFactor: 2,
  },
  
  // Network operations
  NETWORK: {
    maxAttempts: 4,
    baseDelay: 1000,
    maxDelay: 15000,
    backoffFactor: 2,
    retryCondition: (error: any) => {
      return error?.code === 'NETWORK_ERROR' || 
             error?.code === 'TIMEOUT' ||
             error?.message?.includes('fetch');
    },
  },
} as const;

// Helper function to create retry wrapper for service methods
export function createRetryWrapper<T extends Record<string, any>>(
  service: T,
  config: RetryConfig = RETRY_CONFIGS.STANDARD
): T {
  const wrappedService = {} as T;
  
  for (const [key, value] of Object.entries(service)) {
    if (typeof value === 'function') {
      wrappedService[key as keyof T] = (async (...args: any[]) => {
        return withRetry(() => value.apply(service, args), config);
      }) as T[keyof T];
    } else {
      wrappedService[key as keyof T] = value;
    }
  }
  
  return wrappedService;
}