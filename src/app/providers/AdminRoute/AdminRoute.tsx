import { Navigate, Outlet, useLocation } from 'react-router';
import { selectIsAuth, selectUserRole } from '@/entities/session';
import { useAppSelector } from '@/shared/model';
import { Loader } from '@/shared/ui';

export const AdminRoute = () => {
  const isAuth = useAppSelector(selectIsAuth);
  const role = useAppSelector(selectUserRole);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  // `role` is null until useSessionSync's profiles fetch lands -- setSession
  // fires first with blank fields on every INITIAL_SESSION/TOKEN_REFRESHED.
  // Redirecting on that first render would bounce an admin off /admin on
  // every hard refresh; hold the route instead. useSessionSync always
  // resolves this to a non-null role even when the profile fetch fails, so
  // it cannot hang here.
  if (role === null) return <Loader />;

  // Redirect to '/' rather than '/login': PublicRoute would see isAuth and
  // immediately send a non-admin back here via the stored `from`, looping.
  if (role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
};
