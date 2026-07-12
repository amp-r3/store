import { Navigate, Outlet, useLocation } from 'react-router'
import { selectIsAuth } from '@/entities/session'
import { useAppSelector } from "@/shared/model";

export const ProtectedRoute = () => {
  const isAuth = useAppSelector(selectIsAuth)
  const location = useLocation()

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}