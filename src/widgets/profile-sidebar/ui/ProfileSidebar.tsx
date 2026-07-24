import { memo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { FaUser, FaBoxOpen, FaStar } from 'react-icons/fa6';
import { IoNotificationsOutline } from 'react-icons/io5';
import { CgLogOut } from 'react-icons/cg';

import { useAppDispatch } from '@/shared/model';
import { logout, SessionUser, useSignOutMutation } from '@/entities/session';
import { useGetUnreadNotificationsCountQuery } from '@/entities/notification';
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
  const { data: unreadCount } = useGetUnreadNotificationsCountQuery();
  const hasUnread = (unreadCount ?? 0) >= 1;

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
    <aside className={style['profile-sidebar']}>
      <div className={style['profile-sidebar__user-info']}>
        <div className={style['profile-sidebar__avatar']}>
          {getInitial(user.firstName || user.lastName, user.username)}
        </div>
        <div className={style['profile-sidebar__details']}>
          <div className={style['profile-sidebar__name']}>
            {user.firstName || user.lastName 
              ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
              : `@${user.username}`}
          </div>
          {user.email && <div className={style['profile-sidebar__email']}>{user.email}</div>}
        </div>
      </div>

      <nav className={style['profile-sidebar__nav']}>
        <NavLink 
          to="/user" 
          end
          className={({ isActive }) => `${style['profile-sidebar__nav-link']} ${isActive ? style['profile-sidebar__nav-link--active'] : ''}`}
        >
          <FaUser className={style['profile-sidebar__icon']} />
          <span>Profile</span>
        </NavLink>
        
        <NavLink
          to="/user/orders"
          className={({ isActive }) => `${style['profile-sidebar__nav-link']} ${isActive ? style['profile-sidebar__nav-link--active'] : ''}`}
        >
          <FaBoxOpen className={style['profile-sidebar__icon']} />
          <span>Orders History</span>
        </NavLink>

        <NavLink
          to="/user/reviews"
          className={({ isActive }) => `${style['profile-sidebar__nav-link']} ${isActive ? style['profile-sidebar__nav-link--active'] : ''}`}
        >
          <FaStar className={style['profile-sidebar__icon']} />
          <span>My Reviews</span>
        </NavLink>

        <NavLink
          to="/user/notifications"
          className={({ isActive }) => `${style['profile-sidebar__nav-link']} ${isActive ? style['profile-sidebar__nav-link--active'] : ''}`}
        >
          <IoNotificationsOutline className={style['profile-sidebar__icon']} />
          <span>Notifications</span>
          {hasUnread && (
            <span className={style['profile-sidebar__badge']}>
              {(unreadCount ?? 0) > 9 ? '9+' : unreadCount}
            </span>
          )}
        </NavLink>

        <button
          className={style['profile-sidebar__logout-button']}
          onClick={() => setIsLogoutModalOpen(true)}
        >
          <CgLogOut className={style['profile-sidebar__icon']} />
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
