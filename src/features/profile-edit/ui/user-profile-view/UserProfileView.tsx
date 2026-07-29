import { useState } from "react";
import { Button, Modal } from "@/shared/ui";
import { CgTrash, CgLogOut } from "react-icons/cg";

import style from './user-profile-view.module.scss';
import { SessionUser } from "@/entities/session";
import { PROVIDER_CONFIG } from "@/shared/config";

interface UserProfileViewProps {
  user: SessionUser;
  providers: string[];
  onEditClick: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  deleteError?: string;
}

const UserInfoRow = ({ label, value, prefix = '' }: { label: string, value: string | null, prefix?: string }) => (
  <div className={style['profile-view__info-row']}>
    <span className={style['profile-view__label']}>{label}</span>
    <span className={style['profile-view__value']}>{value ? `${prefix}${value}` : '—'}</span>
  </div>
);

const LinkedProviders = ({ providers }: { providers: string[] }) => {
  if (!providers.length) return null;

  return (
    <div className={style['profile-view__providers-section']}>
      <span className={style['profile-view__providers-label']}>Linked accounts</span>
      <div className={style['profile-view__providers-list']}>
        {providers.map((key) => {
          const config = PROVIDER_CONFIG[key.toLowerCase()];
          if (!config) return null;
          return (
            <div key={key} className={style['profile-view__provider-badge']}>
              <span className={style['profile-view__provider-icon']}>{config.icon}</span>
              <span className={style['profile-view__provider-name']}>{config.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const UserProfileView = ({ user, onEditClick, providers, onLogout, onDeleteAccount, deleteError }: UserProfileViewProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  return (
    <div className={style['profile-view']}>
      <div className={style['profile-view__info-list']}>
        <UserInfoRow label="First Name" value={user.firstName} />
        <UserInfoRow label="Last Name" value={user.lastName} />
        <UserInfoRow label="Username" value={user.username} prefix="@" />
        <UserInfoRow label="Email" value={user.email} />
      </div>

      <LinkedProviders providers={providers} />

      <div className={style['profile-view__action-buttons']}>
        <Button variant="primary" onClick={onEditClick}>
          Edit Profile
        </Button>
      </div>

      <section className={style['profile-view__danger-zone']} aria-labelledby="profile-danger-title">
        <h2 id="profile-danger-title" className={style['profile-view__danger-title']}>Danger zone</h2>
        <div className={style['profile-view__danger-actions']}>
          <Button variant="ghost" onClick={() => setIsLogoutModalOpen(true)}>
            Log out
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
            Delete Account
          </Button>
        </div>
      </section>

      {deleteError && (
        <p className={style['profile-view__delete-error']} role="alert">
          {deleteError}
        </p>
      )}

      <Modal
        isOpen={isLogoutModalOpen}
        onOpenChange={setIsLogoutModalOpen}
        title="Log out of your account?"
        description="Are you sure you want to log out? You will need to enter your credentials to log back in."
        icon={<CgLogOut size={50} />}
        actionLabel="Log out"
        actionVariant="danger"
        onAction={() => { setIsLogoutModalOpen(false); onLogout(); }}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete your account?"
        description="This action is permanent and cannot be undone. All your data, settings, and history will be erased immediately."
        icon={<CgTrash size={50} />}
        actionLabel="Delete Account"
        actionVariant="danger"
        onAction={onDeleteAccount}
      />
    </div>
  );
};