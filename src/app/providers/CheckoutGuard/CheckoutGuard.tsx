'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { selectIsAuth } from '@/entities/session';
import { useAppSelector, useIsRehydrated } from "@/shared/model";
import { selectCheckoutItemsMap } from "@/features/checkout-process";

export const CheckoutGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAuth = useAppSelector(selectIsAuth);
  const isRehydrated = useIsRehydrated();
  const orderId = searchParams.get('order');
  const items = useAppSelector(selectCheckoutItemsMap);
  const hasItems = Object.keys(items).length > 0;

  useEffect(() => {
    // Without PersistGate, auth.user and checkout.items both start empty
    // until redux-persist restores them — either check firing early would
    // wrongly bounce someone who's actually signed in with real items.
    if (!isRehydrated) return;

    if (!isAuth) {
      const search = searchParams.toString();
      const from = search ? `${pathname}?${search}` : pathname;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
      return;
    }

    if (!hasItems && !orderId) {
      router.replace('/catalog');
    }
  }, [isRehydrated, isAuth, hasItems, orderId, pathname, searchParams, router]);

  if (!isRehydrated) return null;
  if (!isAuth) return null;
  if (!hasItems && !orderId) return null;

  return <>{children}</>;
};
