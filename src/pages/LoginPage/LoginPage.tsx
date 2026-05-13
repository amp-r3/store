import { useNavigate, Link } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { LoginSchema, loginSchema } from "@/schemas/loginSchema"
import { useLoginMutation, useSignInWithGoogleMutation } from "@/services/authApi"
import style from './login-page.module.scss'
import { AuthLayout } from "@/components/layout/Layout/AuthLayout"
import { FormField, Loader, SignInButton } from "@/components/common"

export const LoginPage = () => {
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()
  const [signInWithGoogle] = useSignInWithGoogleMutation()

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
      navigate('/', { replace: true })
    } catch (err: any) {
      if (err?.status === 401) {
        setError('email', { message: 'Invalid email or password' })
        setError('password', { message: 'Invalid email or password' })
      }
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      const errorMessage = err?.data || err?.message || '';
      setError('root', {
        type: 'server',
        message: errorMessage || 'An error occurred while registering. Please try again later.'
      });
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to access your orders and settings"
    >
      <form className={style.form} onSubmit={handleSubmit(onSubmit)}>

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

        <SignInButton provider="Google" onClick={handleGoogleLogin} />

        <p className={style.footerText}>
          Don't have an account? <Link to="/register" className={style.link}>Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  )
}