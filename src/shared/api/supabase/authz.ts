import 'server-only';
import { createServerSupabaseClient } from './server';

export interface ServerSession {
  userId: string;
  isAdmin: boolean;
}

/** Resolves the current request's signed-in user and admin role in one
 * round trip. Returns null when there is no signed-in user. Same
 * auth.getUser() + profiles.role check app/admin/layout.tsx does inline —
 * centralized here so Server Actions (src/shared/api/revalidate.ts) can
 * reuse it instead of duplicating the query. */
export async function getServerSession(): Promise<ServerSession | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return { userId: user.id, isAdmin: profile?.role === 'admin' };
}
