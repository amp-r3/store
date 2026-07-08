import { Navigate, Outlet, useLocation } from 'react-router'
import { useAppSelector } from '@/hooks'
import { selectIsAuth } from '@/store/selectors/authSelectors'

export const PublicRoute = () => {
  const isAuth = useAppSelector(selectIsAuth)
  const location = useLocation()

  if (isAuth) {
    const storedFrom = sessionStorage.getItem('auth_redirect_from')
    const from = storedFrom || (location.state as any)?.from || '/'
    
    if (storedFrom) {
      sessionStorage.removeItem('auth_redirect_from')
    }

    return <Navigate to={from} replace />
  }

  return <Outlet />
}