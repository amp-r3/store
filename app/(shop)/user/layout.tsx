import type { Metadata } from 'next';
import { ProtectedRoute } from '@/app/providers/ProtectedRoute/ProtectedRoute';
import { UserLayout } from '@/app/layouts/UserLayout/UserLayout';

// Every page under here is per-user data behind auth — force dynamic
// rendering rather than auditing every useSearchParams()/useUrlState() call
// across the profile/orders/reviews/notifications pages for a Suspense
// boundary. Static generation has no upside for private, personalized pages.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false },
};

export default function UserSegmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <UserLayout>{children}</UserLayout>
    </ProtectedRoute>
  );
}
