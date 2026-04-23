import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { JSX } from 'react'
import { selectIsAuth } from '@/store/selectors/authSelectors'


export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuth = useSelector(selectIsAuth)
  const location = useLocation()

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}