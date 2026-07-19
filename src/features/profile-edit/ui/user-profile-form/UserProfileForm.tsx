import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useUpdateProfileMutation } from "@/entities/session"
import { editProfileSchema, EditProfileSchema } from "@/features/profile-edit"
import { FormField, Loader } from "@/shared/ui"
import style from './user-profile-form.module.scss';
import { SessionUser } from "@/entities/session"
import { LuAtSign, LuMail, LuUser } from "react-icons/lu"
import { getErrorMessage } from "@/shared/lib"


interface UserProfileFormProps {
  user: SessionUser;
  isGoogleUser: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export const UserProfileForm = ({ user, onCancel, onSuccess, isGoogleUser }: UserProfileFormProps) => {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()

  const {
    register,
    setError,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<z.input<typeof editProfileSchema>, unknown, EditProfileSchema>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      username: user.username,
    }
  })

  const onSubmit = async (data: EditProfileSchema) => {
    try {
      await updateProfile(data).unwrap()
      onSuccess()
    } catch (err) {
      const errorMessage = getErrorMessage(err);

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
          message: errorMessage || 'An error occurred while saving your profile. Please try again later.'
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
    <form className={style['profile-form']} onSubmit={handleSubmit(onSubmit)}>

      {errors.root && (
        <div className={style['profile-form__error']} role="alert">
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



      <div className={style['profile-form__actions']}>
        <button
          type="button"
          className={style['profile-form__cancel-button']}
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={style['profile-form__submit-button']}
          disabled={isLoading}
        >
          {isLoading ? <Loader size="sm" /> : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}