import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

/** A fresh client per request/render — never share this across requests.
 * Reads always work; writes (token refreshes) only land when the caller can
 * actually set cookies (Route Handlers, Server Actions). A plain Server
 * Component render can't set cookies at all — Next throws — so `setAll`
 * swallows that case. proxy.ts is what keeps the session cookie refreshed
 * for everything else, per @supabase/ssr's own guidance. */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render — cookies are read-only
            // there. Safe to ignore: proxy.ts refreshes the session cookie
            // on every request regardless.
          }
        },
      },
    }
  );
}

/** For `generateStaticParams` and other build-time calls that run outside a
 * request scope — `next/headers`' `cookies()` throws there, so this can't
 * use createServerSupabaseClient. Anonymous, RLS treats it like a
 * logged-out visitor; only fetch genuinely public data with it. */
export function createStaticSupabaseClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
