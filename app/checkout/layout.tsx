'use client';

import { CheckoutGuard } from '@/app/providers/CheckoutGuard/CheckoutGuard';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <CheckoutGuard>{children}</CheckoutGuard>;
}
