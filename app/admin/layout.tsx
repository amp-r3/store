import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/shared/api/supabase/authz';
import { AdminRoute } from '@/app/providers/AdminRoute/AdminRoute';
import { AdminLayout } from '@/app/layouts/AdminLayout/AdminLayout';

// Reads the session on every request anyway (the role check below) and every
// page under here is per-user admin data — force dynamic rather than
// auditing every useSearchParams() call across the admin tables for a
// Suspense boundary.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false },
};

// Server-side gate: redirects a non-admin before any admin HTML reaches the
// browser, so a hard refresh no longer flashes the page before AdminRoute's
// client-side check (still the second line of defense — see AdminRoute)
// kicks it back out. proxy.ts already redirected unauthenticated requests
// away entirely; the `!user` branch here is defense-in-depth, not the
// primary check.
export default async function AdminSegmentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  if (!session.isAdmin) {
    redirect('/');
  }

  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}
