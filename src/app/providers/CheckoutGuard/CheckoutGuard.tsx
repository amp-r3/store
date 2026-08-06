'use client';

import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { selectIsAuth } from '@/entities/session';
import { useAppSelector } from "@/shared/model";
import { selectCheckoutItemsMap } from "@/features/checkout-process";

export const CheckoutGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isAuth = useAppSelector(selectIsAuth);
  const orderId = searchParams.get('order');
  const items = useAppSelector(selectCheckoutItemsMap);
  const hasItems = Object.keys(items).length > 0;

  useEffect(() => {
    if (!isAuth) {
      const search = searchParams.toString();
      const from = search ? `${pathname}?${search}` : pathname;
      router.replace(`/login?from=${encodeURIComponent(from)}`);
      return;
    }

    if (!hasItems && !orderId) {
      router.replace('/catalog');
    }
  }, [isAuth, hasItems, orderId, pathname, searchParams, router]);

  if (!isAuth) return null;
  if (!hasItems && !orderId) return null;

  return <>{children}</>;
};
