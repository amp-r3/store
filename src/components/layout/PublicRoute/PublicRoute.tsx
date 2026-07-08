import { Navigate, Outlet, useLocation } from 'react-router'
import { useAppSelector } from '@/hooks'
import { selectIsAuth } from '@/store/selectors/authSelectors'

export const PublicRoute = () => {
  const isAuth = useAppSelector(selectIsAuth)
  const location = useLocation()

  if (isAuth) {
    const from = (location.state as any)?.from || '/'
    return <Navigate to={from} replace />
  }

  return <Outlet />
}