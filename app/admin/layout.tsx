import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import { AdminRoute } from '@/app/providers/AdminRoute/AdminRoute';
import { AdminLayout } from '@/app/layouts/AdminLayout/AdminLayout';

// Server-side gate: redirects a non-admin before any admin HTML reaches the
// browser, so a hard refresh no longer flashes the page before AdminRoute's
// client-side check (still the second line of defense — see AdminRoute)
// kicks it back out. proxy.ts already redirected unauthenticated requests
// away entirely; the `!user` branch here is defense-in-depth, not the
// primary check.
export default async function AdminSegmentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/');
  }

  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}
