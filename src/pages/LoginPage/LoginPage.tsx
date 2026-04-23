import { FormField } from "@/components/common/FormField/FormField"
import { LoginSchema, loginSchema } from "@/schemas/loginSchema"
import { useLoginMutation } from "@/services/authApi"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router"

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [login, { isLoading }] = useLoginMutation()

  const from = location.state?.from ?? '/'

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginSchema) => {
    try {
      await login(data).unwrap()
      navigate(from, { replace: true })
    } catch (err: any) {
      if (err?.status === 401) {
        setError('username', { message: 'Invalid username or password' })
        setError('password', { message: 'Invalid username or password' })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
        error={errors.password?.message}
        {...register('password')}
      />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Log in'}
      </button>
    </form>
  )
}