import { useState } from "react"
import { useRouter } from "next/navigation"
import { selectUser, useDeleteAccountMutation, useSignOutMutation } from "@/entities/session"
import { UserProfileForm, UserProfileView } from "@/features/profile-edit"
import { useAppSelector } from "@/shared/model";
import { getErrorMessage } from "@/shared/lib";
import { SectionHeader } from "@/shared/ui";
import { ChangePasswordSection } from "./components/change-password-section/ChangePasswordSection";

export const UserPage = () => {
  const user = useAppSelector(selectUser)
  const router = useRouter()
  const [deleteAccount, { error: deleteError, reset: resetDeleteError }] = useDeleteAccountMutation()
  const [signOut] = useSignOutMutation()

  const providers = user?.app_metadata?.providers || [];
  const isGoogleUser = providers.includes('google');
  const hasPasswordIdentity = providers.includes('email');

  const [isEditing, setIsEditing] = useState(false)

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount().unwrap()
      router.replace('/')
    } catch {
      // Surfaced through `deleteError` below.
    }
  }

  const handleLogout = async () => {
    router.replace('/')
    await signOut()
  }

  if (!user) return null;

  return (
    <>
      <SectionHeader
        title={isEditing ? 'Edit Profile' : `Hello, ${user.username}!`}
        subtitle={isEditing
          ? 'Update your personal information below.'
          : 'You can edit fields or just look at your data.'}
      />

      {!isEditing ? (
        <>
          <UserProfileView
            user={user}
            providers={providers}
            onEditClick={() => {
              resetDeleteError()
              setIsEditing(true)
            }}
            onLogout={handleLogout}
            onDeleteAccount={handleDeleteAccount}
            deleteError={deleteError ? getErrorMessage(deleteError) : undefined}
          />
          <ChangePasswordSection hasPasswordIdentity={hasPasswordIdentity} />
        </>
      ) : (
        <UserProfileForm
          user={user}
          isGoogleUser={isGoogleUser}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      )}
    </>
  )
}
