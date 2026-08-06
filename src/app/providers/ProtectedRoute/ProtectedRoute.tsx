'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { selectIsAuth } from '@/entities/session';
import { useAppSelector } from "@/shared/model";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = useAppSelector(selectIsAuth);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isAuth) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [isAuth, pathname, router]);

  if (!isAuth) return null;

  return <>{children}</>;
};
