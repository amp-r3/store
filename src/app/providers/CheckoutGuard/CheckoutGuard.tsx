import { selectIsAuth } from '@/entities/session';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from "@/shared/model";

export const CheckoutGuard = () => {
  const location = useLocation();
  const isAuth = useAppSelector(selectIsAuth);
  const orderId = location.state?.orderId;
  const data = useAppSelector(state => state.checkout.items)

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasItems = data && Object.keys(data).length > 0;

  if (!hasItems && !orderId) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};