import { memo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { FaUser, FaBoxOpen, FaStar } from 'react-icons/fa6';
import { CgLogOut } from 'react-icons/cg';

import { useAppDispatch } from '@/shared/model';
import { logout, SessionUser, useSignOutMutation } from '@/entities/session';
import { Modal } from '@/shared/ui';

import style from './profile-sidebar.module.scss';

interface ProfileSidebarProps {
  user: SessionUser;
}

export const ProfileSidebar = memo(({ user }: ProfileSidebarProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [signOut] = useSignOutMutation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    dispatch(logout());
    await signOut();
    navigate('/', { replace: true });
  };

  const getInitial = (name: string | null, username: string | null) => {
    if (name) return name.charAt(0).toUpperCase();
    if (username) return username.charAt(0).toUpperCase();
    return '?';
  };

  return (
    <aside className={style.sidebar}>
      <div className={style.userInfo}>
        <div className={style.avatar}>
          {getInitial(user.firstName || user.lastName, user.username)}
        </div>
        <div className={style.details}>
          <div className={style.name}>
            {user.firstName || user.lastName 
              ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
              : `@${user.username}`}
          </div>
          {user.email && <div className={style.email}>{user.email}</div>}
        </div>
      </div>

      <nav className={style.nav}>
        <NavLink 
          to="/user" 
          end
          className={({ isActive }) => `${style.navLink} ${isActive ? style.active : ''}`}
        >
          <FaUser className={style.icon} />
          <span>Profile</span>
        </NavLink>
        
        <NavLink
          to="/user/orders"
          className={({ isActive }) => `${style.navLink} ${isActive ? style.active : ''}`}
        >
          <FaBoxOpen className={style.icon} />
          <span>Orders History</span>
        </NavLink>

        <NavLink 
          to="/user/reviews" 
          className={({ isActive }) => `${style.navLink} ${isActive ? style.active : ''}`}
        >
          <FaStar className={style.icon} />
          <span>My Reviews</span>
        </NavLink>

        <button 
          className={style.logoutButton}
          onClick={() => setIsLogoutModalOpen(true)}
        >
          <CgLogOut className={style.icon} />
          <span>Logout</span>
        </button>
      </nav>

      <Modal
        isOpen={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
        title="Log out of your account?"
        description="Are you sure you want to log out? You will need to enter your credentials to log back in."
        icon={<CgLogOut size={50} />}
        actionLabel="Log out"
        actionVariant="danger"
        onAction={handleLogout}
      />
    </aside>
  );
});

ProfileSidebar.displayName = 'ProfileSidebar';
