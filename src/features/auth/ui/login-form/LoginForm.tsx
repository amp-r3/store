import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { LuMail } from 'react-icons/lu';
import { RiLockPasswordLine } from 'react-icons/ri';
import { Alert, FormField } from '@/shared/ui';
import { useHaptics } from '@/shared/lib';
import { useLoginMutation } from '@/entities/session';
import { LoginSchema, loginSchema } from '../../model/loginSchema';
import { useOAuthSignIn } from '../../lib/useOAuthSignIn';
import { useAuthUrlError } from '../../lib/useAuthUrlError';
import { AuthProviderList } from '../auth-provider-list/AuthProviderList';
import { AuthFormActions } from '../auth-form-actions/AuthFormActions';
import { AuthSwitchLink } from '../auth-switch-link/AuthSwitchLink';
import style from './login-form.module.scss';

export const LoginForm = () => {
  const [isEmail, setIsEmail] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const { success } = useHaptics();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched'
  });

  const { errorMsg, blockedProviders } = useAuthUrlError();

  useEffect(() => {
    if (errorMsg) {
      setError('root', {
        type: 'server',
        message: errorMsg
      });
    }
  }, [errorMsg, setError]);

  const signInWithOAuth = useOAuthSignIn((message) => setError('root', { type: 'server', message }));

  const onSubmit = async (data: LoginSchema) => {
    try {
      await login(data).unwrap();
      success();
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'status' in err && err.status === 401) {
        setError('email', { message: 'Invalid email or password' });
        setError('password', { message: 'Invalid email or password' });
      }
    }
  };

  return (
    <form className={style['login-form']} onSubmit={handleSubmit(onSubmit)} noValidate>

      {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

      {isEmail ? (
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

          <Link to="/forgot-password" className={style['login-form__forgot']}>
            Forgot password?
          </Link>

          <AuthFormActions onCancel={() => setIsEmail(false)} submitLabel="Log in" isLoading={isLoading} />
        </>
      ) : (
        <AuthProviderList
          onEmailClick={() => setIsEmail(true)}
          onProviderClick={signInWithOAuth}
          blockedProviders={blockedProviders}
        />
      )}

      <AuthSwitchLink prompt="Don't have an account?" to="/register" label="Sign up" />
    </form>
  );
};
