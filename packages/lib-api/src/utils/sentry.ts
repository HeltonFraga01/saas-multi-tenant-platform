import * as Sentry from '@sentry/browser';
import { validateEnv } from './env';

interface SentryConfig {
  dsn?: string | undefined;
  environment?: string | undefined;
  release?: string | undefined;
  sampleRate?: number | undefined;
  tracesSampleRate?: number | undefined;
  enabled?: boolean | undefined;
}

class SentryService {
  private initialized = false;
  private config: SentryConfig = {};

  init(config?: SentryConfig) {
    if (this.initialized) {
      console.warn('Sentry already initialized');
      return;
    }

    const env = validateEnv();
    
    this.config = {
      dsn: config?.dsn || env.VITE_SENTRY_DSN,
      environment: config?.environment || env.NODE_ENV || 'development',
      release: config?.release || env.VITE_APP_VERSION || '1.0.0',
      sampleRate: config?.sampleRate || 1.0,
      tracesSampleRate: config?.tracesSampleRate || 0.1,
      enabled: config?.enabled ?? (env.NODE_ENV === 'production'),
    };

    if (!this.config.enabled || !this.config.dsn) {
      console.log('Sentry monitoring disabled');
      return;
    }

    try {
      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        release: this.config.release,
        sampleRate: this.config.sampleRate,
        tracesSampleRate: this.config.tracesSampleRate,
        integrations: [],
        beforeSend(event) {
          // Filter out development errors
          if (event?.environment === 'development') {
            return null;
          }
          
          // Filter out known non-critical errors
          if (event?.exception?.values?.[0]?.value?.includes('Network Error')) {
            return null;
          }
          
          return event;
        },
      });

      this.initialized = true;
      console.log('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  captureException(error: Error, context?: Record<string, any>) {
    if (!this.initialized || !this.config.enabled) {
      console.error('Sentry Error:', error, context);
      return;
    }

    Sentry.withScope((scope: Sentry.Scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
    if (!this.initialized || !this.config.enabled) {
      console.log(`Sentry ${level}:`, message, context);
      return;
    }

    Sentry.withScope((scope: Sentry.Scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureMessage(message, level);
    });
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    if (!this.initialized || !this.config.enabled) {
      return;
    }

    Sentry.setUser(user);
  }

  setTag(key: string, value: string) {
    if (!this.initialized || !this.config.enabled) {
      return;
    }

    Sentry.setTag(key, value);
  }

  setContext(key: string, context: Record<string, any>) {
    if (!this.initialized || !this.config.enabled) {
      return;
    }

    Sentry.setContext(key, context);
  }

  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'info' | 'warning' | 'error';
    data?: Record<string, any>;
  }) {
    if (!this.initialized || !this.config.enabled) {
      return;
    }

    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category || 'custom',
      level: breadcrumb.level || 'info',
      data: breadcrumb.data,
      timestamp: Date.now() / 1000,
    });
  }

  startTransaction(name: string, op?: string) {
    if (!this.initialized) {
      return {
        setTag: () => {},
        setData: () => {},
        setStatus: () => {},
        finish: () => {},
      };
    }

    return Sentry.startSpan({ name, op }, (span) => span);
  }

  isInitialized() {
    return this.initialized;
  }

  isEnabled() {
    return this.config.enabled || false;
  }
}

// Export singleton instance
export const sentryService = new SentryService();

// Export types
export type { SentryConfig };

// Export utility functions
export function withSentryErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  context?: Record<string, any>
): T {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      
      // Handle async functions
      if (result instanceof Promise) {
        return result.catch((error) => {
          sentryService.captureException(error, {
            ...context,
            functionName: fn.name,
            arguments: args,
          });
          throw error;
        });
      }
      
      return result;
    } catch (error) {
      sentryService.captureException(error as Error, {
        ...context,
        functionName: fn.name,
        arguments: args,
      });
      throw error;
    }
  }) as T;
}

export function trackApiCall(endpoint: string, method: string, duration: number, status: number) {
  sentryService.addBreadcrumb({
    message: `API Call: ${method} ${endpoint}`,
    category: 'api',
    level: status >= 400 ? 'error' : 'info',
    data: {
      endpoint,
      method,
      duration,
      status,
    },
  });

  if (status >= 400) {
    sentryService.captureMessage(
      `API Error: ${method} ${endpoint} returned ${status}`,
      'error',
      {
        endpoint,
        method,
        duration,
        status,
      }
    );
  }
}