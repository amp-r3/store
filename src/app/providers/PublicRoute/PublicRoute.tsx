import { Navigate, Outlet, useLocation } from 'react-router'
import { selectIsAuth } from '@/entities/session'
import { useAppSelector } from "@/shared/model";
import { LocationState } from "@/shared/types";
import { safeRedirectPath } from "@/shared/lib";
import { AUTH_STORAGE_KEYS } from "@/shared/config";

/** Sole owner of the post-login redirect: reacts to `isAuth` becoming true
 * (from either a password login or an OAuth round-trip) and redirects to
 * wherever the user was headed before being sent to /login or /register. */
export const PublicRoute = () => {
  const isAuth = useAppSelector(selectIsAuth)
  const location = useLocation()

  if (isAuth) {
    const storedFrom = sessionStorage.getItem(AUTH_STORAGE_KEYS.redirectFrom)
    const from = safeRedirectPath(storedFrom || (location.state as LocationState | null)?.from)

    if (storedFrom) {
      sessionStorage.removeItem(AUTH_STORAGE_KEYS.redirectFrom)
    }

    return <Navigate to={from} replace />
  }

  return <Outlet />
}