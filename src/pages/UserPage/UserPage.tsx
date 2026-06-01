import { useState } from "react"
import { useAppSelector } from "@/hooks"
import { selectUser } from "@/store/selectors/authSelectors"
import { useNavigate } from "react-router"
import { BackButton } from "@/components/common"
import style from './user-page.module.scss'
import { UserProfileForm } from "./components/UserProfileForm/UserProfileForm"
import { UserProfileView } from "./components/UserProfileView/UserProfileView"
import { AuthLayout } from "@/components/layout/Layout/AuthLayout/AuthLayout"

export const UserPage = () => {
  const user = useAppSelector(selectUser)

  const providers = user?.app_metadata?.providers || [];
  const isGoogleUser = providers.includes('google');
  const isTelegramUser = providers.includes('telegram');
  const navigate = useNavigate()

  const [isEditing, setIsEditing] = useState(false)

  if (!user) return null;

  return (
    <main className='container'>
      <BackButton onClick={() => navigate('/')} />

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