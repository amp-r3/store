import { useNavigation, useLocation, Outlet } from 'react-router';
import { Suspense } from 'react';

// Custom Components
import { Navbar } from '@/widgets/navbar';
import { MobileBar } from '@/widgets/mobile-bar';
import { Footer } from '@/widgets/footer';
import { TopBar } from '@/widgets/top-bar';

// Redux Hooks
// Functions and Selectors
import { closeCart } from '@/entities/cart';
import { selectIsCartOpen } from '@/entities/cart';

// Style
import style from './main-layout.module.scss';
import { Loader, TopBarLoader } from "@/shared/ui";
import { useAppDispatch } from "@/shared/model";
import { useAppSelector } from "@/shared/model";
import { CartDrawer } from "@/widgets/cart-drawer";
import { ReviewModal } from "@/features/order-review";

export const MainLayout = () => {
    const navigation = useNavigation();
    const location = useLocation();
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(selectIsCartOpen);
    const isLoading = navigation.state === 'loading';
    const isHomePage = location.pathname === '/';

    const handleClose = () => {
        dispatch(closeCart())
    }


    return (
        <>
            <TopBar isOverlay={isHomePage} />
            <div className={style.layout}>
                <Navbar isOverlay={isHomePage} />
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