import { useState } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch } from "@/hooks";
import { logout } from "@/store/slices/authSlice";
import { supabase } from "@/supabase";
import { Modal } from "@/components/common";
import { CgLogOut, CgTrash } from "react-icons/cg";
import style from './user-profile-view.module.scss';
import { SessionUser } from "@/types/auth";


interface UserProfileViewProps {
  user: SessionUser;
  onEditClick: () => void;
}

const UserInfoRow = ({ label, value, prefix = '' }: { label: string, value: string | null, prefix?: string }) => (
  <div className={style.infoRow}>
    <span className={style.label}>{label}</span>
    <span className={style.value}>{value ? `${prefix}${value}` : '—'}</span>
  </div>
);

export const UserProfileView = ({ user, onEditClick }: UserProfileViewProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    dispatch(logout());
    await supabase.auth.signOut();
  };

  const handleDeleteAccount = async () => {
    const { error } = await supabase.functions.invoke('delete-account');

    if (!error) {
      await supabase.auth.signOut();
      navigate('/', { replace: true });
    }
  };

  return (
    <div className={style.profileView}>
      <div className={style.infoList}>
        <UserInfoRow label="First Name" value={user.firstName} />
        <UserInfoRow label="Last Name" value={user.lastName} />
        <UserInfoRow label="Username" value={user.username} prefix="@" />
        <UserInfoRow label="Email" value={user.email} />
      </div>

      <div className={style.actionButtons}>
        <button
          className={style.editButton}
          onClick={onEditClick}
        >
          Edit Profile
        </button>
        <div className={style.dangerRow}>
          <button
            className={style.logoutButton}
            onClick={() => setIsLogoutModalOpen(true)}
          >
            Logout
          </button>
          <button
            className={style.deleteButton}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

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

      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete your account?"
        description="This action is permanent and cannot be undone. All your data, settings, and history will be erased immediately."
        icon={<CgTrash size={50} />}
        actionLabel="Delete Account"
        actionVariant="danger"
        onAction={handleDeleteAccount}
      />
    </div>
  );
};