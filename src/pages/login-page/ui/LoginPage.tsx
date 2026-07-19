import { AuthLayout } from "@/app/layouts/AuthLayout/AuthLayout";
import style from "@/app/layouts/AuthLayout/auth-layout.module.scss";
import { useNavigate, Link, useLocation } from "react-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { LoginSchema, loginSchema } from "@/features/auth"
import { useLoginMutation, useSignInWithGoogleMutation, useSignInWithTelegramMutation } from "@/entities/session"
import { useState, useEffect } from "react"
import { LuMail } from "react-icons/lu";
import { RiLockPasswordLine } from "react-icons/ri"
import { FormField, Loader } from "@/shared/ui";
import { useAuthUrlError } from "@/entities/session";
import { SignInButton } from "@/features/auth";
import { LocationState } from "@/shared/types";
import { getErrorMessage } from "@/shared/lib";

export const LoginPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from || '/'
  const [isEmail, setIsEmail] = useState(false)
  const [login, { isLoading }] = useLoginMutation()
  const [signInWithGoogle] = useSignInWithGoogleMutation()
  const [signInWithTelegram] = useSignInWithTelegramMutation()

  const { errorMsg, blockedProviders } = useAuthUrlError()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched'
  })

  useEffect(() => {
    if (errorMsg) {
      setError('root', {
        type: 'server',
        message: errorMsg
      })
    }
  }, [errorMsg, setError])

  const onSubmit = async (data: LoginSchema) => {
    try {
      await login(data).unwrap()
      navigate(from, { replace: true })
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'status' in err && err.status === 401) {
        setError('email', { message: 'Invalid email or password' })
        setError('password', { message: 'Invalid email or password' })
      }
    }
  }

  const handleGoogleLogin = async () => {
    try {
      sessionStorage.setItem('oauth_provider', 'Google')
      sessionStorage.setItem('auth_redirect_from', from)
      await signInWithGoogle().unwrap()
    } catch (err) {
      setError('root', {
        type: 'server',
        message: getErrorMessage(err) || 'An error occurred while logging in. Please try again later.'
      });
    }
  }

  const handleTelegramLogin = async () => {
    try {
      sessionStorage.setItem('oauth_provider', 'Telegram')
      sessionStorage.setItem('auth_redirect_from', from)
      await signInWithTelegram().unwrap()
    } catch (err) {
      setError('root', {
        type: 'server',
        message: getErrorMessage(err) || 'An error occurred while logging in. Please try again later.'
      });
    }
  }

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Log in to access your orders and settings"
      icon={<RiLockPasswordLine />}
    >
      <form className={style.auth} onSubmit={handleSubmit(onSubmit)}>

        {errors.root && (
          <div className={style['auth__root-message']} role="alert">
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
              <div className={style.auth__actions}>
                <button
                  type="button"
                  onClick={() => setIsEmail(false)}
                  className={style.auth__cancelBtn}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={style.auth__submitBtn}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader size="sm" /> : 'Log in'}
                </button>
              </div>
            </> :
            <>
              <SignInButton provider="Email" onClick={() => setIsEmail(true)} />
              <SignInButton provider="Google" onClick={handleGoogleLogin} disabled={blockedProviders.includes('Google')} />
              <SignInButton provider="Telegram" onClick={handleTelegramLogin} disabled={blockedProviders.includes('Telegram')} />
            </>
        }
        <p className={style['auth__footer-text']}>
          Don't have an account? <Link to="/register" className={style.auth__link}>Sign up</Link>
        </p>
      </form>
    </AuthLayout>
  )
}