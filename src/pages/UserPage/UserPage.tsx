import { AuthLayout } from "@/components/layout/Layout/AuthLayout"
import { useAppDispatch, useAppSelector } from "@/hooks"
import { EditProfileSchema, editProfileSchema } from "@/schemas/editProfileSchema"
import { selectUser } from "@/store/selectors/authSelectors"
import { edit } from "@/store/slices/authSlice"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router"
import style from './user-page.module.scss'
import { FormField } from "@/components/common/FormField/FormField"
import { StoredUser } from "@/types/auth"

export const UserPage = () => {
  const user = useAppSelector(selectUser)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
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
      password: ''
    }
  })

  const onSubmit = (data: EditProfileSchema) => {
    const users: StoredUser[] = JSON.parse(
      localStorage.getItem('users') || '[]'
    )
    const stored = users.find(u => u.id === user.id)

    if (!stored || stored.password !== data.password) {
      setError('password', { message: 'Incorrect password' })
      return
    }

    const { password, ...rest } = data
    dispatch(edit(rest))
    navigate(from, { replace: true })
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
        >
          Edit
        </button>
      </form>
    </AuthLayout >
  )
}