import { useNavigate, Link } from "react-router"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { RegisterSchema, registerSchema } from "@/schemas/registerSchema"
import { useRegisterMutation } from "@/services/authApi"
import { FormField } from "@/components/common/FormField/FormField"
import style from './register-page.module.scss'
import { AuthLayout } from "@/components/layout/Layout/AuthLayout"
import { Loader } from "@/components/common"

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

  const onSubmit = async (data: RegisterSchema) => {
    try {
      await register(data).unwrap()
      navigate('/')
    } catch (err: any) {
      if (err?.status === 409) {
        setError('username', { message: 'Username is already taken' })
      }
    }
  }

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Join us to start managing your orders"
    >
      <form className={style.form} onSubmit={handleSubmit(onSubmit)} noValidate>

        <div className={style.row}>
          <FormField
            label='Name'
            error={errors.firstName?.message}
            {...registerField('firstName')}
          />
          <FormField
            label='Last Name'
            error={errors.lastName?.message}
            {...registerField('lastName')}
          />
        </div>

        <FormField
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
          {isLoading ? <Loader size="sm"/> : 'Register'}
        </button>

        <p className={style.footerText}>
          Already have an account? <Link to="/login" className={style.link}>Log in</Link>
        </p>

      </form>
    </AuthLayout>
  )
}