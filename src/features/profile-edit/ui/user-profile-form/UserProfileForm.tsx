import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router"
import { useUpdateProfileMutation } from "@/entities/session"
import { editProfileSchema } from "@/features/profile-edit/model/editProfileSchema"
import { FormField, Loader } from "@/shared/ui"
import style from './user-profile-form.module.scss';
import { SessionUser } from "@/entities/session/model/types"
import { LuAtSign, LuMail, LuUser } from "react-icons/lu"


interface UserProfileFormProps {
  user: SessionUser;
  isTelegramUser: boolean;
  isGoogleUser: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const UserProfileForm = ({ user, onCancel, onSuccess, isGoogleUser }: UserProfileFormProps) => {
  const navigate = useNavigate()
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()

  const {
    register,
    setError,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      username: user.username,
    }
  })

  const onSubmit = async (data: any) => {
    try {
      await updateProfile(data).unwrap()
      onSuccess()
      navigate('/', { replace: true })
    } catch (err: any) {
      console.error('Registration error details:', JSON.stringify(err, null, 2));

      const errorMessage = err?.data || err?.message || '';

      const errText = errorMessage.toLowerCase();

      if (errText.includes('already registered') || errText.includes('already exists')) {
        setError('email', {
          type: 'server',
          message: 'This email is already registered'
        });
      } else if (errText.includes('duplicate key value violates unique constraint "profiles_username_key"')) {
        setError('username', {
          type: 'server',
          message: 'This username is already taken'
        })
      }
      else {
        setError('root', {
          type: 'server',
          message: errorMessage || 'An error occurred while registering. Please try again later.'
        });
      }
    }
  }

  const handleCancel = () => {
    reset()
    onCancel()
  }

  const emailError = errors.email?.message
    ? errors.email.message
    : isGoogleUser
      ? "Your email is linked to Google. You can't change it here."
      : undefined;

  return (
    <form className={style.form} onSubmit={handleSubmit(onSubmit)}>

      {errors.root && (
        <div className={style.root} role="alert">
          {errors.root.message}
        </div>
      )}

      <FormField
        label='First name'
        icon={<LuUser />}
        error={errors.firstName?.message}
        {...register('firstName')}
      />

      <FormField
        label='Last name'
        icon={<LuUser />}
        error={errors.lastName?.message}
        {...register('lastName')}
      />

      <FormField
        label='Username'
        icon={<LuAtSign />}
        error={errors.username?.message}
        {...register('username')}
      />
      <FormField
        label='Email'
        icon={<LuMail />}
        disabled={isGoogleUser}
        error={emailError}
        {...register('email')}
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