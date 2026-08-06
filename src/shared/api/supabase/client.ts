import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '../database.types';

// PKCE is required for email-link flows (password reset) — the implicit
// flow has no `?code=` to exchange. The exchange itself now happens on the
// server (app/auth/callback/route.ts reads the code verifier from a cookie
// this client wrote), so detectSessionInUrl stays off — the browser client
// must never try to consume the `?code=` itself.
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
