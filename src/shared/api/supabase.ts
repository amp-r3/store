import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // PKCE is required for email-link flows (password reset) — the implicit
    // flow has no `?code=` to exchange. `detectSessionInUrl` handles the
    // exchange automatically on the first document load; no manual
    // `exchangeCodeForSession` call should be added anywhere (the code
    // verifier is single-use and the client already consumes it here).
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});