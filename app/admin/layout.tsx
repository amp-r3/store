'use client';

import { AdminRoute } from '@/app/providers/AdminRoute/AdminRoute';
import { AdminLayout } from '@/app/layouts/AdminLayout/AdminLayout';

export default function AdminSegmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}
