import { Loader } from '@/components/common';
import { useAppSelector, useCartDetails } from '@/hooks';
import { useGetCartQuery } from '@/services/cartApi';
import { selectIsAuth } from '@/store/selectors/authSelectors';
import { CartProduct } from '@/store/selectors/cartSelectors';
import { CartItem } from '@/types/products';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Header } from '../Header/Header';


export const CheckoutGuard = () => {
  const location = useLocation();

  const isAuth = useAppSelector(selectIsAuth)

  const { isLoading, isFetching, isEmpty, cartDetails } = useCartDetails()


  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isFetching && isEmpty) {
    return <Navigate to="/" replace />;
  }

  const hasOutOfStockItems = cartDetails.some((item) => item.availabilityStatus === 'Out of stock');
  if (hasOutOfStockItems) {
    return <Navigate to="/" replace />;
  }

  return (
    <Outlet />
  )

};