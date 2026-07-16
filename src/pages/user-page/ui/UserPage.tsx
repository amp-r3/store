import { useState } from "react"
import { selectUser } from "@/entities/session"
import { Breadcrumbs } from "@/shared/ui"
import { UserProfileForm } from "@/features/profile-edit"
import { UserProfileView } from "@/entities/user"
import { useAppSelector } from "@/shared/model";
import { ProfileSidebar } from "@/widgets/profile-sidebar";

import style from './user-page.module.scss'

export const UserPage = () => {
  const user = useAppSelector(selectUser)

  const providers = user?.app_metadata?.providers || [];
  const isGoogleUser = providers.includes('google');
  const isTelegramUser = providers.includes('telegram');

  const [isEditing, setIsEditing] = useState(false)

  if (!user) return null;

  return (
    <main className={`container ${style.page}`}>
      <div className={style.header__wrapper}>
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Profile' }]} />
      </div>

      <article className={style.pageWrapper}>
        <ProfileSidebar user={user} />
        
        <section className={style.contentArea}>
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
          </div>
        </section>
      </article>
    </main>
  )
}