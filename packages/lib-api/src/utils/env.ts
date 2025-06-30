/**
 * Environment variables validation
 */

export interface EnvConfig {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  VITE_OPENPIX_APP_ID?: string;
  VITE_ASAAS_API_KEY?: string;
  VITE_EVO_AGENT_URL?: string;
  VITE_APP_URL?: string;
  VITE_SENTRY_DSN?: string;
  VITE_APP_VERSION?: string;
  NODE_ENV?: string;
}

/**
 * Validate required environment variables
 */
export function validateEnv(): EnvConfig {
  const env = {
    VITE_SUPABASE_URL: import.meta?.env?.VITE_SUPABASE_URL || process.env['VITE_SUPABASE_URL'],
    VITE_SUPABASE_ANON_KEY: import.meta?.env?.VITE_SUPABASE_ANON_KEY || process.env['VITE_SUPABASE_ANON_KEY'],
    VITE_OPENPIX_APP_ID: import.meta?.env?.VITE_OPENPIX_APP_ID || process.env['VITE_OPENPIX_APP_ID'],
    VITE_ASAAS_API_KEY: import.meta?.env?.VITE_ASAAS_API_KEY || process.env['VITE_ASAAS_API_KEY'],
    VITE_EVO_AGENT_URL: import.meta?.env?.VITE_EVO_AGENT_URL || process.env['VITE_EVO_AGENT_URL'],
    VITE_APP_URL: import.meta?.env?.VITE_APP_URL || process.env['VITE_APP_URL'],
    VITE_SENTRY_DSN: import.meta?.env?.['VITE_SENTRY_DSN'] || process.env['VITE_SENTRY_DSN'],
    VITE_APP_VERSION: import.meta?.env?.['VITE_APP_VERSION'] || process.env['VITE_APP_VERSION'],
    NODE_ENV: import.meta?.env?.['NODE_ENV'] || process.env['NODE_ENV'],
  };

  // Required variables
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const;
  const missing = required.filter(key => !env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return env as EnvConfig;
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return (
    import.meta?.env?.DEV ||
    process.env['NODE_ENV'] === 'development' ||
    process.env['VITE_ENV'] === 'development'
  );
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return (
    import.meta?.env?.PROD ||
    process.env['NODE_ENV'] === 'production' ||
    process.env['VITE_ENV'] === 'production'
  );
}