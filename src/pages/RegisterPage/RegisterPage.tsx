import { useNavigate, Link } from "react-router"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { RegisterSchema, registerSchema } from "@/schemas/registerSchema"
import { useRegisterMutation, useSignInWithGoogleMutation } from "@/services/authApi"
import '@/styles/auth-page.scss'
import { FormField, Loader, SignInButton } from "@/components/common"
import { AuthLayout } from "@/components/layout/Layout/AuthLayout/AuthLayout"
import { useState } from "react"
import { LuMail } from "react-icons/lu";
import { RiLockPasswordLine, RiShieldCheckLine } from "react-icons/ri"

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [isEmail, setIsEmail] = useState(false)
  const [register, { isLoading }] = useRegisterMutation()
  const [signInWithGoogle] = useSignInWithGoogleMutation()

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched'
  })

  const onSubmit = async (formData: RegisterSchema) => {
    try {
      await register(formData).unwrap();
      navigate('/');
    } catch (err: any) {
      console.error('Registration error details:', JSON.stringify(err, null, 2));

      const errorMessage = err?.data || err?.message || '';

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
      title="Create an Account"
      subtitle="Join us to start managing your orders"
    >
      <form className='auth' onSubmit={handleSubmit(onSubmit)} noValidate>

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
                error={errors.password?.message}
                {...registerField('password')}
              />

              <FormField
                label='Repeat password'
                type='password'
                icon={<RiShieldCheckLine />}
                placeholder="Confirm your password"
                error={errors.confirm?.message}
                {...registerField('confirm')}
              />
              <div className='auth__actions'>
                <button
                  type="button"
                  className='auth__cancelBtn'
                  onClick={() => setIsEmail(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className='auth__submitBtn'
                  disabled={isLoading}
                >
                  {isLoading ? <Loader size="sm" /> : 'Register'}
                </button>
              </div>
            </> :
            <>
              <SignInButton provider="Email" onClick={() => setIsEmail(true)} />
              <SignInButton provider="Google" onClick={handleGoogleLogin} />
            </>

        }




        <p className='auth__footer-text'>
          Already have an account? <Link to="/login" className='auth__link'>Log in</Link>
        </p>

      </form>
    </AuthLayout>
  )
}