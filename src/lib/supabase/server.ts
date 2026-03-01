import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for server-side data fetching.
 * Uses anon key with recipi schema.
 * Works in both request context and static generation.
 */
export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'recipi' },
    }
  )
}

/**
 * Creates a Supabase client with service_role key.
 * Bypasses RLS - use only for admin operations (import scripts, etc.)
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: 'recipi' },
    }
  )
}
