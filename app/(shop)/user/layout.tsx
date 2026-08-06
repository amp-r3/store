'use client';

import { ProtectedRoute } from '@/app/providers/ProtectedRoute/ProtectedRoute';
import { UserLayout } from '@/app/layouts/UserLayout/UserLayout';

export default function UserSegmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <UserLayout>{children}</UserLayout>
    </ProtectedRoute>
  );
}
