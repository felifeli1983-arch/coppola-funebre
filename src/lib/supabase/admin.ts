import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from './env';

/**
 * Service-role Supabase client — bypasses RLS. SERVER ONLY.
 * Use for admin writes and for order creation from the Stripe webhook.
 * Never import this into a Client Component.
 */
export function createAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase admin not configured (SUPABASE_SERVICE_ROLE_KEY missing)');
  }
  return createSupabaseClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
