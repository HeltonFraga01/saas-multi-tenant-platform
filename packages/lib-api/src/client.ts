import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types/database';
import { validateEnv } from './utils/env';

let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Create and configure Supabase client
 */
export function createClient(supabaseUrl?: string, supabaseAnonKey?: string): SupabaseClient<Database> {
  // Validate environment variables
  const env = validateEnv();
  
  const url = supabaseUrl || env.VITE_SUPABASE_URL;
  const key = supabaseAnonKey || env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL and Anon Key are required');
  }

  supabaseClient = createSupabaseClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });

  return supabaseClient;
}

/**
 * Get existing Supabase client instance
 */
export function getClient(): SupabaseClient<Database> {
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Call createClient() first.');
  }
  return supabaseClient;
}

/**
 * Reset client instance (useful for testing)
 */
export function resetClient(): void {
  supabaseClient = null;
}