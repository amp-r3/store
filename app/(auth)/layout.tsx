'use client';

import { PublicRoute } from '@/app/providers/PublicRoute/PublicRoute';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <PublicRoute>{children}</PublicRoute>;
}
