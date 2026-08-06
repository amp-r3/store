import type { Metadata } from 'next';
import { CheckoutGuard } from '@/app/providers/CheckoutGuard/CheckoutGuard';

// Per-user checkout state (Redux + auth) — force dynamic rendering rather
// than auditing every useSearchParams() call across the checkout stepper
// for a Suspense boundary. Static generation has no upside here.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <CheckoutGuard>{children}</CheckoutGuard>;
}
