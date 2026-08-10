import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/api/database.types';
import { e2eEnv } from './env';

/** Service-role client for E2E setup/teardown only — bypasses RLS.
 * `orders`/`order_items` have zero write policies for the anon/user key
 * (AGENTS.md), so this is the only way to seed/clean up an order. Never
 * import this from app code or from a spec file directly. */
export function createSupabaseAdminClient() {
  return createClient<Database>(e2eEnv.supabaseUrl, e2eEnv.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
