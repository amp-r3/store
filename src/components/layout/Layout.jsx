import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import style from './layout.module.scss';

const Layout = () => {
    return (
        <div className={style.layout}>
            <Navbar />
            <div className="container">
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;