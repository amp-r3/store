import { AuthLayout } from "@/components/layout/Layout/AuthLayout"
import { useAppSelector } from "@/hooks"
import { EditProfileSchema, editProfileSchema } from "@/schemas/editProfileSchema"
import { selectUser } from "@/store/selectors/authSelectors"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router"
import style from './user-page.module.scss'
import { FormField } from "@/components/common/FormField/FormField"
import { useUpdateProfileMutation } from "@/services/authApi"
import { Loader } from "@/components/common"

export const UserPage = () => {
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()
  const location = useLocation()

  const [updateProfile, { isLoading }] = useUpdateProfileMutation()
  const from = location.state?.from ?? '/'

  const {
    register,
    setError,
    handleSubmit,
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
      await updateProfile(data).unwrap();

      navigate(from, { replace: true });

    } catch (error: any) {
      if (error?.data === 'Incorrect current password') {
        setError('password', { message: 'Incorrect password' });
      }
    }
  }
  return (
    <AuthLayout
      title={'Hello ' + user.username}
      subtitle="You can edit fields or just look at your data."
    >
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
          label='Password'
          type="password"
          error={errors.password?.message}
          {...register('password')}
        />

        <button
          type="submit"
          className={style.submitButton}
          disabled={isLoading}
        >
          {isLoading ? <Loader size="sm" /> : 'Register'}
        </button>
      </form>
    </AuthLayout >
  )
}