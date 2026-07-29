import { useState } from "react";
import { Modal } from "@/shared/ui";
import { CgTrash } from "react-icons/cg";

import style from './user-profile-view.module.scss';
import { SessionUser } from "@/entities/session";
import { PROVIDER_CONFIG } from "@/shared/config";

interface UserProfileViewProps {
  user: SessionUser;
  providers: string[];
  onEditClick: () => void;
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

export const UserProfileView = ({ user, onEditClick, providers, onDeleteAccount, deleteError }: UserProfileViewProps) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        <button
          className={style['profile-view__edit-button']}
          onClick={onEditClick}
        >
          Edit Profile
        </button>
        <div className={style['profile-view__danger-row']}>
          <button
            className={style['profile-view__delete-button']}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Account
          </button>
        </div>
      </div>

      {deleteError && (
        <p className={style['profile-view__delete-error']} role="alert">
          {deleteError}
        </p>
      )}

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