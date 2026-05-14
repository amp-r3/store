import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router"
import { useUpdateProfileMutation } from "@/services/authApi"
import { EditProfileSchema, editProfileSchema } from "@/schemas/editProfileSchema"
import { FormField, Loader } from "@/components/common"
import style from './user-profile-form.module.scss';
import { SessionUser } from "@/types/auth"


interface UserProfileFormProps {
  user: SessionUser;
  onCancel: () => void;
  onSuccess: () => void;
}

export const UserProfileForm = ({ user, onCancel, onSuccess }: UserProfileFormProps) => {
  const navigate = useNavigate()
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()

  const {
    register,
    setError,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<EditProfileSchema>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email,
      username: user.username,
      password: ''
    }
  })

  const onSubmit = async (data: EditProfileSchema) => {
    try {
      await updateProfile(data).unwrap()
      onSuccess()
      navigate('/', { replace: true })
    } catch (error: any) {
      if (error?.data === 'Incorrect current password') {
        setError('password', { message: 'Incorrect password' })
      }
    }
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  return (
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
        label='Current Password (to confirm changes)'
        type="password"
        error={errors.password?.message}
        {...register('password')}
      />

      <div className={style.formActions}>
        <button
          type="button"
          className={style.cancelButton}
          onClick={handleCancel}
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
  )
}