import { useNavigate, Link } from "react-router"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { RegisterSchema, registerSchema } from "@/schemas/registerSchema"
import { useRegisterMutation } from "@/services/authApi"
import style from './register-page.module.scss'
import { AuthLayout } from "@/components/layout/Layout/AuthLayout"
import { FormField, Loader } from "@/components/common"

export const RegisterPage = () => {
  const navigate = useNavigate()
  const [register, { isLoading }] = useRegisterMutation()

  const {
    register: registerField,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema)
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

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join us to start managing your orders"
    >
      <form className={style.form} onSubmit={handleSubmit(onSubmit)} noValidate>

        {errors.root && (
          <div className={style.root} role="alert">
            {errors.root.message}
          </div>
        )}

        <div className={style.row}>
          <FormField
            label='First name'
            error={errors.firstName?.message}
            optional
            {...registerField('firstName')}
          />
          <FormField
            optional
            label='Last name'
            error={errors.lastName?.message}
            {...registerField('lastName')}
          />
        </div>

        <FormField
          optional
          label="Username"
          error={errors.username?.message}
          {...registerField('username')}
        />

        <FormField
          label='Email'
          type="email"
          error={errors.email?.message}
          {...registerField('email')}
        />

        <FormField
          label='Password'
          type='password'
          error={errors.password?.message}
          {...registerField('password')}
        />

        <FormField
          label='Repeat password'
          type='password'
          error={errors.confirm?.message}
          {...registerField('confirm')}
        />

        <button
          type="submit"
          className={style.submitButton}
          disabled={isLoading}
        >
          {isLoading ? <Loader size="sm" /> : 'Register'}
        </button>

        <p className={style.footerText}>
          Already have an account? <Link to="/login" className={style.link}>Log in</Link>
        </p>

      </form>
    </AuthLayout>
  )
}