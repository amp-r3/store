import { useNavigation, Outlet } from 'react-router';
import { Suspense, useEffect } from 'react';

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
import { useTheme } from '@/hooks';
import { Header } from '../Header/Header';
import { supabase } from '@/supabase';
import { logout, setSession } from '@/store/slices/authSlice';


export const Layout = () => {
    useTheme();
    const navigation = useNavigation();
    const isLoading = navigation.state === 'loading';
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(selectIsCartOpen);
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                dispatch(setSession({
                    user: {
                        id: session.user.id,
                        firstName: session.user.user_metadata.firstName,
                        lastName: session.user.user_metadata.lastName,
                        username: session.user.user_metadata.username,
                        email: session.user.email!,
                        accessToken: session.access_token,
                    },
                    token: session.access_token,
                }));
            } else if (event === 'SIGNED_OUT') {
                dispatch(logout());
            }
        });

        return () => subscription.unsubscribe();
    }, [dispatch]);

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