import { useState } from "react"
import { useNavigate } from "react-router"
import { selectUser, useDeleteAccountMutation } from "@/entities/session"
import { UserProfileForm } from "@/features/profile-edit"
import { UserProfileView } from "@/entities/user"
import { useAppSelector } from "@/shared/model";
import { getErrorMessage } from "@/shared/lib";

import style from './user-page.module.scss'

export const UserPage = () => {
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()
  const [deleteAccount, { error: deleteError }] = useDeleteAccountMutation()

  const providers = user?.app_metadata?.providers || [];
  const isGoogleUser = providers.includes('google');

  const [isEditing, setIsEditing] = useState(false)

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap()
      navigate('/', { replace: true })
    } catch {
      // Surfaced through `deleteError` below.
    }
  }

  if (!user) return null;

  return (
    <>
      <header className={style.contentHeader}>
        <h1 className={style.title}>
          {isEditing ? 'Edit Profile' : `Hello, ${user.username}!`}
        </h1>
        <p className={style.subtitle}>
          {isEditing
            ? 'Update your personal information below.'
            : 'You can edit fields or just look at your data.'}
        </p>
      </header>

      <div className={style.contentBody}>
        {!isEditing ? (
          <UserProfileView
            user={user}
            providers={providers}
            onEditClick={() => setIsEditing(true)}
            onDeleteAccount={handleDeleteAccount}
            deleteError={deleteError ? getErrorMessage(deleteError) : undefined}
          />
        ) : (
          <UserProfileForm
            user={user}
            isGoogleUser={isGoogleUser}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        )}
      </div>
    </>
  )
}