import { useState } from "react"
import { AuthLayout } from "@/components/layout/Layout/AuthLayout"
import { useAppDispatch, useAppSelector } from "@/hooks"
import { EditProfileSchema, editProfileSchema } from "@/schemas/editProfileSchema"
import { selectUser } from "@/store/selectors/authSelectors"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router"
import style from './user-page.module.scss'
import { FormField } from "@/components/common/FormField/FormField"
import { useUpdateProfileMutation } from "@/services/authApi"
import { Loader } from "@/components/common"
import { logout } from "@/store/slices/authSlice"
import { supabase } from "@/supabase"
import { Modal } from "@/components/common/Modal/Modal"
import { CgLogOut } from "react-icons/cg";

export const UserPage = () => {
  const user = useAppSelector(selectUser)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const [isEditing, setIsEditing] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation()
  const from = location.state?.from ?? '/'

  const {
    register,
    setError,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditProfileSchema>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
      password: ''
    }
  })

  const onSubmit = async (data: EditProfileSchema) => {
    try {
      await updateProfile(data).unwrap()
      setIsEditing(false)
    } catch (error: any) {
      if (error?.data === 'Incorrect current password') {
        setError('password', { message: 'Incorrect password' })
      }
    }
  }

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    dispatch(logout())
    await supabase.auth.signOut()
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    reset()
  }

  return (
    <AuthLayout
      title={isEditing ? 'Edit Profile' : `Hello, ${user.username}!`}
      subtitle={isEditing ? 'Update your personal information below.' : 'You can edit fields or just look at your data.'}
    >
      {!isEditing ? (
        <div className={style.profileView}>
          <div className={style.infoList}>
            <div className={style.infoRow}>
              <span className={style.label}>First Name</span>
              <span className={style.value}>{user.firstName || '—'}</span>
            </div>
            <div className={style.infoRow}>
              <span className={style.label}>Last Name</span>
              <span className={style.value}>{user.lastName || '—'}</span>
            </div>
            <div className={style.infoRow}>
              <span className={style.label}>Username</span>
              <span className={style.value}>@{user.username}</span>
            </div>
            <div className={style.infoRow}>
              <span className={style.label}>Email</span>
              <span className={style.value}>{user.email}</span>
            </div>
          </div>

          <div className={style.actionButtons}>
            <button
              className={style.editButton}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
            <button
              className={style.logoutButton}
              onClick={() => setIsLogoutModalOpen(true)}
            >
              Logout
            </button>
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
        </div>
      ) : (
        <form className={style.form} onSubmit={handleSubmit(onSubmit)}>
          <FormField
            label='First name'
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <FormField
            label='Last name'
            error={errors.lastName?.message}
            {...register('lastName')}
          />

          <FormField
            label='Username'
            error={errors.username?.message}
            {...register('username')}
          />

          <FormField
            label='Email'
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <FormField
            label='Current Password (to confirm changes)'
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className={style.formActions}>
            <button
              type="button"
              className={style.cancelButton}
              onClick={handleCancelEdit}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={style.submitButton}
              disabled={isLoading}
            >
              {isLoading ? <Loader size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

    </AuthLayout>
  )
}