import Navbar from './Navbar/Navbar';
import style from './layout.module.scss';
import { useNavigation, Outlet } from 'react-router';
import { Loader } from '@/components/ui';
import { Suspense } from 'react';

const Layout = () => {
    const navigation = useNavigation();
    const isLoading = navigation.state === 'loading'
    return (
        <div className={style.layout}>
            <Navbar />
            <div className="container">
                {
                    isLoading && <Loader />
                }
                <Suspense fallback={<Loader />}>
                    <Outlet />
                </Suspense>
            </div>
        </div>
    );
};

export default Layout;