import { useLocation, useNavigate, Link } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { LoginSchema, loginSchema } from "@/schemas/loginSchema"
import { useLoginMutation } from "@/services/authApi"
import { FormField } from "@/components/common/FormField/FormField"
import style from './login-page.module.scss'
import { AuthLayout } from "@/components/layout/Layout/AuthLayout"
import { Loader } from "@/components/common"

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
        setError('email', { message: 'Invalid email or password' })
        setError('password', { message: 'Invalid email or password' })
      }
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to access your orders and settings"
    >
      <form className={style.form} onSubmit={handleSubmit(onSubmit)}>

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
          {isLoading ? <Loader size="sm" /> : 'Log in'}
        </button>

        <p className={style.footerText}>
          Don't have an account? <Link to="/register" className={style.link}>Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  )
}