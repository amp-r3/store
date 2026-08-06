import { selectIsAuth } from '@/entities/session';
import { Navigate, Outlet, useLocation } from 'react-router';
import { useAppSelector } from "@/shared/model";
import { selectCheckoutItemsMap } from "@/features/checkout-process";

export const CheckoutGuard = () => {
  const location = useLocation();
  const isAuth = useAppSelector(selectIsAuth);
  const orderId = location.state?.orderId;
  const items = useAppSelector(selectCheckoutItemsMap)

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  const hasItems = Object.keys(items).length > 0;

  if (!hasItems && !orderId) {
    return <Navigate to="/catalog" replace />;
  }

  return <Outlet />;
};