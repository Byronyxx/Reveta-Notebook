import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

/**
 * Creates a Supabase admin client using the service_role key.
 * This bypasses RLS — use ONLY in server-side API routes
 * where user identity has already been verified via getUser().
 */
export function createAdminClient() {
    return createSupabaseClient(
        env.NEXT_PUBLIC_SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}
