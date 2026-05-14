import { useNavigate, Link } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { LoginSchema, loginSchema } from "@/schemas/loginSchema"
import { useLoginMutation, useSignInWithGoogleMutation } from "@/services/authApi"
import '@/styles/auth-page.scss'
import { FormField, Loader, SignInButton } from "@/components/common"
import { AuthLayout } from "@/components/layout/Layout/AuthLayout/AuthLayout"
import { useState } from "react"
import { LuMail } from "react-icons/lu";
import { RiLockPasswordLine } from "react-icons/ri"

export const LoginPage = () => {
  const navigate = useNavigate()
  const [isEmail, setIsEmail] = useState(false)
  const [login, { isLoading }] = useLoginMutation()
  const [signInWithGoogle] = useSignInWithGoogleMutation()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched'
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
      <form className='auth' onSubmit={handleSubmit(onSubmit)}>

        {errors.root && (
          <div className='auth__root-message' role="alert">
            {errors.root.message}
          </div>
        )}

        {
          isEmail ?
            <>
              <FormField
                label='Email'
                type="email"
                error={errors.email?.message}
                icon={<LuMail />}
                placeholder="you@example.com"
                {...register('email')}
              />

              <FormField
                label='Password'
                type="password"
                icon={<RiLockPasswordLine />}
                placeholder="Enter your password"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className='auth__actions'>
                <button
                  type="button"
                  onClick={() => setIsEmail(false)}
                  className='auth__cancelBtn'>
                  Cancel
                </button>
                <button
                  type="submit"
                  className='auth__submitBtn'
                  disabled={isLoading}
                >
                  {isLoading ? <Loader size="sm" /> : 'Log in'}
                </button>
              </div>
            </> :
            <>

              <SignInButton provider="Email" onClick={() => setIsEmail(true)} />
              <SignInButton provider="Google" onClick={handleGoogleLogin} />
            </>
        }
        <p className='auth__footer-text'>
          Don't have an account? <Link to="/register" className='auth__link'>Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  )
}