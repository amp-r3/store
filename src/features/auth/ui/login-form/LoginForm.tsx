import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LuMail } from 'react-icons/lu';
import { RiLockPasswordLine } from 'react-icons/ri';
import { Alert, FormField, useAuthCardLoading } from '@/shared/ui';
import { useCapsLock, useHaptics, getErrorMessage } from '@/shared/lib';
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
  const [login, { isLoading, isSuccess }] = useLoginMutation();
  const { success } = useHaptics();
  const errorRef = useRef<HTMLDivElement>(null);
  const { isCapsLockOn, capsLockProps } = useCapsLock();

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const { errorMsg, failedProviders } = useAuthUrlError();

  useEffect(() => {
    if (errorMsg) {
      setError('root', {
        type: 'server',
        message: errorMsg,
      });
    }
  }, [errorMsg, setError]);

  useEffect(() => {
    if (errors.root) errorRef.current?.focus();
  }, [errors.root]);

  useEffect(() => {
    if (isEmail) setFocus('email');
  }, [isEmail, setFocus]);

  const { signInWithOAuth, pendingProvider } = useOAuthSignIn((message) =>
    setError('root', { type: 'server', message }),
  );

  // Stays true until PublicRoute redirects away, so the button doesn't flash
  // back from spinner to label between the mutation resolving and the redirect.
  const isSubmitting = isLoading || isSuccess;
  useAuthCardLoading(isSubmitting || pendingProvider !== null);

  const onSubmit = async (data: LoginSchema) => {
    try {
      await login(data).unwrap();
      success();
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'status' in err && err.status === 401) {
        setError('root', { message: 'Invalid email or password' });
      } else {
        setError('root', { type: 'server', message: getErrorMessage(err) });
      }
    }
  };

  return (
    <form className={style['login-form']} onSubmit={handleSubmit(onSubmit)} noValidate>
      {errors.root && (
        <div className={style['login-form__error']}>
          <Alert ref={errorRef} tabIndex={-1} variant="error">
            {errors.root.message}
          </Alert>
        </div>
      )}

      <div
        key={isEmail ? 'email' : 'providers'}
        data-direction={isEmail ? 'forward' : 'back'}
        className={style['login-form__step']}
      >
        {isEmail ? (
          <>
            <FormField
              label="Email"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              autoComplete="email"
              error={errors.email?.message}
              icon={<LuMail />}
              placeholder="you@example.com"
              {...register('email')}
            />

            <FormField
              label="Password"
              type="password"
              icon={<RiLockPasswordLine />}
              placeholder="Enter your password"
              autoComplete="current-password"
              error={errors.password?.message}
              warning={isCapsLockOn ? 'Caps Lock is on' : undefined}
              {...register('password')}
              {...capsLockProps}
            />

            <AuthFormActions
              onBack={() => setIsEmail(false)}
              submitLabel="Log in"
              isLoading={isSubmitting}
            />
          </>
        ) : (
          <AuthProviderList
            onEmailClick={() => setIsEmail(true)}
            onProviderClick={signInWithOAuth}
            failedProviders={failedProviders}
            pendingProvider={pendingProvider}
          />
        )}
      </div>

      <AuthSwitchLink prompt="Don't have an account?" to="/register" label="Sign up" />
    </form>
  );
};
