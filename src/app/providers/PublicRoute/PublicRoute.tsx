import { Navigate, Outlet, useLocation } from 'react-router'
import { selectIsAuth } from '@/entities/session'
import { useAppSelector } from "@/shared/model";
import { LocationState } from "@/shared/types";
import { safeRedirectPath } from "@/shared/lib";

export const PublicRoute = () => {
  const isAuth = useAppSelector(selectIsAuth)
  const location = useLocation()

  if (isAuth) {
    const storedFrom = sessionStorage.getItem('auth_redirect_from')
    const from = safeRedirectPath(storedFrom || (location.state as LocationState | null)?.from)

    if (storedFrom) {
      sessionStorage.removeItem('auth_redirect_from')
    }

    return <Navigate to={from} replace />
  }

  return <Outlet />
}