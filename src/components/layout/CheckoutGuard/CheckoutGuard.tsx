import { Loader } from '@/components/common';
import { useAppSelector } from '@/hooks';
import { useGetCartQuery } from '@/services/cartApi';
import { selectIsAuth } from '@/store/selectors/authSelectors';
import { Navigate, Outlet, useLocation } from 'react-router-dom';


export const CheckoutGuard = () => {
  const location = useLocation();
  const isAuth = useAppSelector(selectIsAuth);

  const { data, isLoading, isFetching } = useGetCartQuery(undefined, {
    skip: !isAuth,
  });

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading || isFetching) {
    return <Loader />;
  }

  if (!data || Object.keys(data).length === 0) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};