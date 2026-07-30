import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LuMail } from 'react-icons/lu';
import { RiLockPasswordLine, RiShieldCheckLine } from 'react-icons/ri';
import { Alert, FormField, PasswordRequirements, PasswordStrength } from '@/shared/ui';
import { useCapsLock, useHaptics, getErrorMessage } from '@/shared/lib';
import { useRegisterMutation } from '@/entities/session';
import { RegisterSchema, registerSchema } from '../../model/registerSchema';
import { useOAuthSignIn } from '../../lib/useOAuthSignIn';
import { useAuthUrlError } from '../../lib/useAuthUrlError';
import { AuthProviderList } from '../auth-provider-list/AuthProviderList';
import { AuthFormActions } from '../auth-form-actions/AuthFormActions';
import { AuthSwitchLink } from '../auth-switch-link/AuthSwitchLink';
import style from './register-form.module.scss';

const PASSWORD_REQUIREMENTS_ID = 'register-password-requirements';

export const RegisterForm = () => {
  const [isEmail, setIsEmail] = useState(false);
  const [registerUser, { isLoading }] = useRegisterMutation();
  const { success } = useHaptics();
  const errorRef = useRef<HTMLDivElement>(null);
  const { isCapsLockOn, capsLockProps } = useCapsLock();

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    watch,
    formState: { errors, touchedFields, isSubmitted }
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched'
  });

  const passwordValue = watch('password') || '';

  const { errorMsg, blockedProviders } = useAuthUrlError();

  useEffect(() => {
    if (errorMsg) {
      setError('root', {
        type: 'server',
        message: errorMsg
      });
    }
  }, [errorMsg, setError]);

  useEffect(() => {
    if (errors.root) errorRef.current?.focus();
  }, [errors.root]);

  useEffect(() => {
    if (isEmail) setFocus('email');
  }, [isEmail, setFocus]);

  const signInWithOAuth = useOAuthSignIn((message) => setError('root', { type: 'server', message }));

  const onSubmit = async (formData: RegisterSchema) => {
    try {
      await registerUser(formData).unwrap();
      success();
    } catch (err) {
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
          message: errorMessage
        });
      }
    }
  };

  return (
    <form className={style['register-form']} onSubmit={handleSubmit(onSubmit)} noValidate>

      {errors.root && (
        <div className={style['register-form__error']}>
          <Alert ref={errorRef} tabIndex={-1} variant="error">{errors.root.message}</Alert>
        </div>
      )}

      <div
        key={isEmail ? 'email' : 'providers'}
        data-direction={isEmail ? 'forward' : 'back'}
        className={style['register-form__step']}
      >
        {isEmail ? (
          <>
            <FormField
              label='Email'
              type="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              autoComplete="email"
              icon={<LuMail />}
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <FormField
              label='Password'
              type='password'
              icon={<RiLockPasswordLine />}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              aria-describedby={PASSWORD_REQUIREMENTS_ID}
              error={!!errors.password}
              warning={isCapsLockOn ? 'Caps Lock is on' : undefined}
              {...register('password')}
              {...capsLockProps}
            />

            <PasswordStrength password={passwordValue} />

            <PasswordRequirements
              id={PASSWORD_REQUIREMENTS_ID}
              password={passwordValue}
              showUnmetAsError={touchedFields.password || isSubmitted}
            />

            <FormField
              label='Repeat password'
              type='password'
              icon={<RiShieldCheckLine />}
              placeholder="Confirm your password"
              autoComplete="new-password"
              error={errors.confirm?.message}
              {...register('confirm')}
            />

            <AuthFormActions onBack={() => setIsEmail(false)} submitLabel="Register" isLoading={isLoading} />
          </>
        ) : (
          <AuthProviderList
            onEmailClick={() => setIsEmail(true)}
            onProviderClick={signInWithOAuth}
            blockedProviders={blockedProviders}
          />
        )}
      </div>

      <AuthSwitchLink prompt="Already have an account?" to="/login" label="Log in" />
    </form>
  );
};
