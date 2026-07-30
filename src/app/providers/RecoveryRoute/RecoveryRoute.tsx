import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { selectToken } from '@/entities/session';
import { useAppSelector } from '@/shared/model';
import { AuthCard, Loader } from '@/shared/ui';

const RECOVERY_SETTLE_MS = 4000;

/** Gate for /reset-password. Unlike PublicRoute/ProtectedRoute this checks
 * `selectToken`, not `selectIsAuth`: `auth.user` is restored from redux-persist
 * on every load, while `auth.token` is stripped by the persist transform and
 * only repopulated by useSessionSync from a live Supabase session. A recovery
 * link is exactly "live session, persisted user may or may not exist" — so
 * `token` is the correct signal, and gating on `isAuth` would either bounce a
 * legitimate recovery visit or let a stale persisted user in without one. */
export const RecoveryRoute = () => {
  const token = useAppSelector(selectToken);
  const [isSettling, setIsSettling] = useState(!token);

  useEffect(() => {
    if (token) {
      setIsSettling(false);
      return;
    }

    const id = window.setTimeout(() => setIsSettling(false), RECOVERY_SETTLE_MS);
    return () => window.clearTimeout(id);
  }, [token]);

  if (token) {
    return <Outlet />;
  }

  if (isSettling) {
    return (
      <AuthCard title="Checking your link…" subtitle="One moment.">
        <Loader />
      </AuthCard>
    );
  }

  return <Navigate to="/forgot-password" replace state={{ linkExpired: true }} />;
};
