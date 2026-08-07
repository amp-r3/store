import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

export { default } from '@/views/wishlist-page';
