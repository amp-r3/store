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
import { clearCart, closeCart } from '@/store/slices/cartSlice';
import { selectIsCartOpen } from '@/store/selectors/cartSelectors';

// Style
import style from './layout.module.scss';
import { Footer } from '../Footer/Footer';
import { useTheme } from '@/hooks';
import { Header } from '../Header/Header';
import { supabase } from '@/supabase';
import { logout, setSession } from '@/store/slices/authSlice';
import { store } from '@/app/store';
import { cartApi, useSyncCartMutation } from '@/services/cartApi';


export const Layout = () => {
    useTheme();
    const navigation = useNavigation();
    const isLoading = navigation.state === 'loading';
    const dispatch = useAppDispatch();
    const isOpen = useAppSelector(selectIsCartOpen);
    const [syncCart] = useSyncCartMutation();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
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
                }

                if (event === 'SIGNED_IN' && session?.user) {
                    const currentState = store.getState();
                    const localCartItems = currentState.cart.items;

                    if (localCartItems && Object.keys(localCartItems).length > 0) {
                        try {
                            await syncCart(localCartItems).unwrap();
                            dispatch(clearCart());
                        } catch (error) {
                            console.error('Error synchronizing cart:', error);
                        }
                    }
                }

                else if (event === 'SIGNED_OUT') {
                    dispatch(cartApi.util.resetApiState());
                    dispatch(clearCart());
                    dispatch(logout());
                }
            });

        return () => subscription.unsubscribe();
    }, [dispatch, syncCart]);

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