import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { LuAtSign, LuMail, LuUser } from "react-icons/lu"
import { useUpdateProfileMutation, SessionUser } from "@/entities/session"
import { Alert, Button, FormField } from "@/shared/ui"
import { getErrorMessage } from "@/shared/lib"
import { editProfileSchema, EditProfileSchema } from "../../model/editProfileSchema"

import style from './user-profile-form.module.scss';

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

  const emailDescription = !errors.email?.message && isGoogleUser
    ? "Your email is linked to Google. You can't change it here."
    : undefined;

  return (
    <form className={style['profile-form']} onSubmit={handleSubmit(onSubmit)} noValidate>

      {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

      <FormField
        label='First name'
        icon={<LuUser />}
        autoComplete="given-name"
        error={errors.firstName?.message}
        {...register('firstName')}
      />

      <FormField
        label='Last name'
        icon={<LuUser />}
        autoComplete="family-name"
        error={errors.lastName?.message}
        {...register('lastName')}
      />

      <FormField
        label='Username'
        icon={<LuAtSign />}
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
      />
      <FormField
        label='Email'
        icon={<LuMail />}
        disabled={isGoogleUser}
        autoComplete="email"
        error={errors.email?.message}
        description={emailDescription}
        {...register('email')}
      />

      <div className={style['profile-form__actions']}>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </form>
  )
}
