import { AuthLayout } from "@/app/layouts/AuthLayout/AuthLayout";
import { useState } from "react"
import { selectUser } from "@/entities/session"
import { Breadcrumbs } from "@/shared/ui"
import style from './user-page.module.scss'
import { UserProfileForm } from "../../../features/profile-edit/ui/user-profile-form/UserProfileForm"
import { UserProfileView } from "../../../entities/user/ui/user-profile-view/UserProfileView"
import { useAppSelector } from "@/shared/model";

export const UserPage = () => {
  const user = useAppSelector(selectUser)

  const providers = user?.app_metadata?.providers || [];
  const isGoogleUser = providers.includes('google');
  const isTelegramUser = providers.includes('telegram');

  const [isEditing, setIsEditing] = useState(false)

  if (!user) return null;

  return (
    <main className='container'>
      <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Profile' }]} />

      <article className={style.pageWrapper}>
        <AuthLayout
          isFullPage={false}
          title={isEditing ? 'Edit Profile' : `Hello, ${user.username}!`}
          subtitle={isEditing
            ? 'Update your personal information below.'
            : 'You can edit fields or just look at your data.'}
        >
          {!isEditing ? (
            <UserProfileView
              user={user}
              providers={providers}
              onEditClick={() => setIsEditing(true)}
            />
          ) : (
            <UserProfileForm
              user={user}
              isTelegramUser={isTelegramUser}
              isGoogleUser={isGoogleUser}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => setIsEditing(false)}
            />
          )}
        </AuthLayout>
      </article>
    </main>
  )
}