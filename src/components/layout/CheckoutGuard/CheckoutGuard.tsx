import { useAppSelector } from '@/hooks';
import { selectIsAuth } from '@/store/selectors/authSelectors';
import { Navigate, Outlet, useLocation } from 'react-router-dom';


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