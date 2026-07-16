import { useState } from "react";
import { useNavigate } from "react-router";
import { logout } from "@/entities/session";
import { supabase } from "@/shared/api";
import { Modal } from "@/shared/ui";
import { CgLogOut, CgTrash } from "react-icons/cg";

import style from './user-profile-view.module.scss';
import { SessionUser } from "@/entities/session";
import { PROVIDER_CONFIG } from "@/shared/config";
import { useAppDispatch } from "@/shared/model";

interface UserProfileViewProps {
  user: SessionUser;
  providers: string[];
  onEditClick: () => void;
}

const UserInfoRow = ({ label, value, prefix = '' }: { label: string, value: string | null, prefix?: string }) => (
  <div className={style.infoRow}>
    <span className={style.label}>{label}</span>
    <span className={style.value}>{value ? `${prefix}${value}` : '—'}</span>
  </div>
);

const LinkedProviders = ({ providers }: { providers: string[] }) => {
  if (!providers.length) return null;

  return (
    <div className={style.providersSection}>
      <span className={style.providersLabel}>Linked accounts</span>
      <div className={style.providersList}>
        {providers.map((key) => {
          const config = PROVIDER_CONFIG[key.toLowerCase()];
          if (!config) return null;
          return (
            <div key={key} className={style.providerBadge}>
              <span className={style.providerIcon}>{config.icon}</span>
              <span className={style.providerName}>{config.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const UserProfileView = ({ user, onEditClick, providers }: UserProfileViewProps) => {
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

      <LinkedProviders providers={providers} />

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