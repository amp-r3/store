import { useNavigation, Outlet } from 'react-router';
import { Suspense } from 'react';

// Custom Components
import CartDrawer from '@/features/cart/components/Cart/CartDrawer';
import Navbar from './Navbar/Navbar';
import { Loader } from '@/components/ui';

// Redux Hooks
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { closeCart } from '@/features/cart/store/cartSlice';

// Style
import style from './layout.module.scss';

const Layout = () => {
    const navigation = useNavigation();
    const isLoading = navigation.state === 'loading';
    const dispatch = useAppDispatch();
    const { isOpen } = useAppSelector((state) => state.cart);

    const handleClose = () => {
        dispatch(closeCart())
    }

    return (
        <div className={style.layout}>
            <Navbar />
            <div className="container">
                {
                    isLoading && <Loader />
                }
                <Suspense fallback={<Loader />}>
                    <Outlet />
                    <CartDrawer
                        isOpen={isOpen}
                        onClose={handleClose}
                    />
                </Suspense>
            </div>
        </div>
    );
};

export default Layout;