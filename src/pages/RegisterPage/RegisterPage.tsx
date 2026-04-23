import { useNavigate } from "react-router"
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { RegisterSchema, registerSchema } from "@/schemas/registerSchema"
import { useRegisterMutation } from "@/services/authApi"
import { FormField } from "@/components/common/FormField/FormField"

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
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

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

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Register'}
      </button>

    </form>
  )
}
