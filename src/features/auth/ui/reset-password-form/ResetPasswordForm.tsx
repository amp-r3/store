import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { RiLockPasswordLine, RiShieldCheckLine } from 'react-icons/ri';
import { Alert, Button, FormField, PasswordRequirements, PasswordStrength } from '@/shared/ui';
import { useHaptics, getErrorMessage } from '@/shared/lib';
import { selectUser, setRecoverySession, useUpdatePasswordMutation } from '@/entities/session';
import { useAppDispatch, useAppSelector } from '@/shared/model';
import { NewPasswordSchema, newPasswordSchema } from '../../model/newPasswordSchema';

export const ResetPasswordForm = () => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [updatePassword, { isLoading }] = useUpdatePasswordMutation();
  const { success } = useHaptics();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, touchedFields, isSubmitted }
  } = useForm<NewPasswordSchema>({
    resolver: zodResolver(newPasswordSchema),
    mode: 'onTouched'
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async ({ password }: NewPasswordSchema) => {
    try {
      await updatePassword({ password }).unwrap();
      dispatch(setRecoverySession(false));
      success();
      navigate('/user', { replace: true });
    } catch (err) {
      setError('root', { type: 'server', message: getErrorMessage(err) });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

      {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

      {/* Read-only, not part of the form data: reassures the user which
          account is being reset and gives password managers the username
          anchor they need to save the new credential against the right
          account (a `hidden` input is ignored by most managers). */}
      <FormField label="Account" value={user?.email ?? ''} disabled readOnly autoComplete="username" />

      <FormField
        label="New password"
        type="password"
        icon={<RiLockPasswordLine />}
        placeholder="At least 6 characters"
        error={!!errors.password}
        {...register('password')}
      />

      <PasswordStrength password={passwordValue} />

      <PasswordRequirements
        password={passwordValue}
        showUnmetAsError={touchedFields.password || isSubmitted}
      />

      <FormField
        label="Repeat password"
        type="password"
        icon={<RiShieldCheckLine />}
        placeholder="Confirm your password"
        error={errors.confirm?.message}
        {...register('confirm')}
      />

      <Button type="submit" variant="primary" isLoading={isLoading}>
        Update password
      </Button>
    </form>
  );
};
