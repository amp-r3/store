import { AuthLayout } from "@/app/layouts/AuthLayout/AuthLayout";
import style from "@/app/layouts/AuthLayout/auth-layout.module.scss";
import { useNavigate, Link, useLocation } from "react-router"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { RegisterSchema, registerSchema } from "@/features/auth"
import { useRegisterMutation, useSignInWithGoogleMutation, useSignInWithTelegramMutation } from "@/entities/session"
import { useState, useEffect } from "react"
import { LuMail } from "react-icons/lu";
import { RiLockPasswordLine, RiShieldCheckLine, RiUserAddLine } from "react-icons/ri"
import { FormField, Loader } from "@/shared/ui";
import { useAuthUrlError } from "@/entities/session";
import { SignInButton } from "@/features/auth";
import { PasswordRequirements } from "./password-requirements/PasswordRequirements";
import { LocationState } from "@/shared/types";
import { getErrorMessage } from "@/shared/lib";

export const RegisterPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from || '/'
  const [isEmail, setIsEmail] = useState(false)
  const [register, { isLoading }] = useRegisterMutation()
  const [signInWithGoogle] = useSignInWithGoogleMutation()
  const [signInWithTelegram] = useSignInWithTelegramMutation()

  const { errorMsg, blockedProviders } = useAuthUrlError()

  const {
    register: registerField,
    handleSubmit,
    setError,
    watch,
    formState: { errors, touchedFields, isSubmitted }
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched'
  })

  const passwordValue = watch('password') || '';

  useEffect(() => {
    if (errorMsg) {
      setError('root', {
        type: 'server',
        message: errorMsg
      })
    }
  }, [errorMsg, setError])

  const onSubmit = async (formData: RegisterSchema) => {
    try {
      await register(formData).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Registration error details:', JSON.stringify(err, null, 2));

      const errorMessage = getErrorMessage(err);

      const errText = errorMessage.toLowerCase();

      if (errText.includes('already registered') || errText.includes('already exists')) {
        setError('email', {
          type: 'server',
          message: 'This email is already registered'
        });
      }
      else if (errText.includes('password')) {
        setError('password', {
          type: 'server',
          message: 'The password is too weak'
        });
      }
      else {
        setError('root', {
          type: 'server',
          message: errorMessage || 'An error occurred while registering. Please try again later.'
        });
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      sessionStorage.setItem('oauth_provider', 'Google')
      sessionStorage.setItem('auth_redirect_from', from)
      await signInWithGoogle().unwrap()
    } catch (err) {
      setError('root', {
        type: 'server',
        message: getErrorMessage(err) || 'An error occurred while registering. Please try again later.'
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
        message: getErrorMessage(err) || 'An error occurred while registering. Please try again later.'
      });
    }
  }

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join us to start managing your orders"
      icon={<RiUserAddLine />}
    >
      <form className={style.auth} onSubmit={handleSubmit(onSubmit)} noValidate>

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
                icon={<LuMail />}
                placeholder="you@example.com"
                error={errors.email?.message}
                {...registerField('email')}
              />

              <FormField
                label='Password'
                type='password'
                icon={<RiLockPasswordLine />}
                placeholder="At least 6 characters"
                error={!!errors.password}
                {...registerField('password')}
              />

              <PasswordRequirements 
                password={passwordValue} 
                hasError={touchedFields.password || isSubmitted} 
              />

              <FormField
                label='Repeat password'
                type='password'
                icon={<RiShieldCheckLine />}
                placeholder="Confirm your password"
                error={errors.confirm?.message}
                {...registerField('confirm')}
              />
              <div className={style.auth__actions}>
                <button
                  type="button"
                  className={style.auth__cancelBtn}
                  onClick={() => setIsEmail(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={style.auth__submitBtn}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader size="sm" /> : 'Register'}
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
          Already have an account? <Link to="/login" className={style.auth__link}>Log in</Link>
        </p>

      </form>
    </AuthLayout>
  )
}