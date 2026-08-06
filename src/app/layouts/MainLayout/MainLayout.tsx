'use client';

import { usePathname } from 'next/navigation';

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
import { useAppDispatch } from "@/shared/model";
import { useAppSelector } from "@/shared/model";
import { useMediaQuery } from "@/shared/lib/hooks";
import { CartDrawer } from "@/widgets/cart-drawer";
import { ReviewModal } from "@/features/order-review";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(selectIsCartOpen);
    const isHomePage = pathname === '/';
    const isMobileBarWidth = useMediaQuery('(max-width: 525px)');

    const handleClose = () => {
        dispatch(closeCart())
    }


    return (
        <>
            <TopBar isOverlay={isHomePage} />
            <div className={style.layout}>
                <Navbar isOverlay={isHomePage} />
                {children}
                <CartDrawer
                    isOpen={isOpen}
                    onClose={handleClose}
                />
                <ReviewModal />
                {isMobileBarWidth && (
                    <div className={style.mobileBar}>
                        <MobileBar />
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};
