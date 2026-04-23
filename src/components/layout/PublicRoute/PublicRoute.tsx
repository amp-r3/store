import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuth } from '@/store/selectors/authSelectors'

export const PublicRoute = () => {
  const isAuth = useSelector(selectIsAuth)

  if (isAuth) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}