'use client';

import { MainLayout } from '@/app/layouts/MainLayout/MainLayout';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <MainLayout>{children}</MainLayout>;
}
