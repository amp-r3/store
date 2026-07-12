import { useNavigation, Outlet } from 'react-router';
import { Suspense } from 'react';

// Custom Components
import { Navbar } from '@/widgets/navbar/Navbar';
import { MobileBar } from '@/widgets/mobile-bar/MobileBar';
import { Footer } from '@/widgets/footer/Footer';
import { Header } from '@/widgets/header/Header';

// Redux Hooks
// Functions and Selectors
import { closeCart } from '@/entities/cart';
import { selectIsCartOpen } from '@/entities/cart';

// Style
import style from './main-layout.module.scss';
import { Loader, TopBarLoader } from "@/shared/ui";
import { useAppDispatch } from "@/shared/model";
import { useAppSelector } from "@/shared/model";
import { useAuthSync } from "@/entities/session";
import { CartDrawer } from "@/widgets/cart-drawer";
import { ReviewModal } from "@/features/order-review";

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
                <TopBarLoader isLoading={isLoading} />
                <Suspense fallback={<Loader />}>
                    <Outlet />
                    <CartDrawer
                        isOpen={isOpen}
                        onClose={handleClose}
                    />
                    <ReviewModal />
                    <div className={style.mobileBar}>
                        <MobileBar />
                    </div>
                </Suspense>
            </div>
            <Footer />
        </>
    );
};