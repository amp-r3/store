import { Loader } from '@/components/common';
import { useAppSelector } from '@/hooks';
import { useGetCartQuery } from '@/services/cartApi';
import { selectIsAuth } from '@/store/selectors/authSelectors';
import { Navigate, Outlet, useLocation } from 'react-router-dom';


export const CheckoutGuard = () => {
  const location = useLocation();
  const isAuth = useAppSelector(selectIsAuth);
  const orderId = location.state?.orderId

  const { data, isLoading, isFetching } = useGetCartQuery(undefined, {
    skip: !isAuth,
  });

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!data || Object.keys(data).length === 0) {
    if (!orderId) {
      return
    }
    return <Navigate to="/" replace />;
  }

  if (isLoading || isFetching) {
    return <Loader />;
  }

  return <Outlet />;
};