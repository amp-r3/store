import { useNavigation, Outlet } from 'react-router';
import { Suspense } from 'react';

// Custom Components
import { Navbar } from '../../Navbar/Navbar';
import { CartDrawer } from '@/components/cart';
import { MobileBar } from '../../MobileBar/MobileBar';
import { Loader } from '@/components/common';
import { Footer } from '../../Footer/Footer';
import { Header } from '../../Header/Header';

// Redux Hooks
import { useAppDispatch, useAppSelector } from '@/hooks';

// Functions and Selectors
import { closeCart } from '@/store/slices/cartSlice';
import { selectIsCartOpen } from '@/store/selectors/cartSelectors';

// Style
import style from './main-layout.module.scss';
import { useAuthSync } from '@/hooks';

export const MainLayout = () => {
    const navigation = useNavigation();
    const dispatch = useAppDispatch();
    useAuthSync();
    const isOpen = useAppSelector(selectIsCartOpen);
    const isLoading = navigation.state === 'loading';

    const handleClose = () => {
        dispatch(closeCart())
    }


    return (
        <>
            <Header />
            <div className={style.layout}>
                <div className={style.header}>
                    <Navbar />
                </div>
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