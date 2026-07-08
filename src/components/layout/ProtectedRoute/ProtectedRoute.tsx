import { Navigate, Outlet, useLocation } from 'react-router'
import { useAppSelector } from '@/hooks'
import { selectIsAuth } from '@/store/selectors/authSelectors'

export const ProtectedRoute = () => {
  const isAuth = useAppSelector(selectIsAuth)
  const location = useLocation()

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}