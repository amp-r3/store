import { useNavigation, Outlet } from 'react-router';
import { Suspense } from 'react';

// Custom Components
import { Navbar } from '../Navbar/Navbar';
import { CartDrawer } from '@/components/cart';
import { MobileBar } from '../MobileBar/MobileBar';
import { Loader } from '@/components/common';

// Redux Hooks
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
// Functions and Selectors
import { closeCart } from '@/store/slices/cartSlice';
import { selectIsCartOpen } from '@/store/selectors/cartSelectors';

// Style
import style from './layout.module.scss';
import { Footer } from '../Footer/Footer';

export const Layout = () => {
    const navigation = useNavigation();
    const isLoading = navigation.state === 'loading';
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(selectIsCartOpen);

    const handleClose = () => {
        dispatch(closeCart())
    }

    return (
        <>
            <div className={style.layout}>
                <Navbar />
                {
                    isLoading && <Loader />
                }
                <Suspense fallback={<Loader />}>
                    <Outlet />
                    <CartDrawer
                        isOpen={isOpen}
                        onClose={handleClose}
                    />
                    <div className={style.mobileBar}>
                        <MobileBar />
                    </div>
                </Suspense>
            </div>
            <Footer />
        </>
    );
};