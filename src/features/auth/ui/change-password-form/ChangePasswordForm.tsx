import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { RiLockPasswordLine, RiShieldCheckLine, RiShieldKeyholeLine } from 'react-icons/ri';
import { Alert, FormField, PasswordRequirements, PasswordStrength } from '@/shared/ui';
import { getErrorMessage, useCapsLock, useHaptics } from '@/shared/lib';
import { useChangePasswordMutation } from '@/entities/session';
import { ChangePasswordSchema, changePasswordSchema } from '../../model/changePasswordSchema';
import { AuthFormActions } from '../auth-form-actions/AuthFormActions';
import style from './change-password-form.module.scss';

const PASSWORD_REQUIREMENTS_ID = 'change-password-requirements';

interface ChangePasswordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChangePasswordForm = ({ onSuccess, onCancel }: ChangePasswordFormProps) => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { success } = useHaptics();
  const { isCapsLockOn, capsLockProps } = useCapsLock();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, touchedFields, isSubmitted }
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onTouched'
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async ({ currentPassword, password }: ChangePasswordSchema) => {
    try {
      await changePassword({ currentPassword, newPassword: password }).unwrap();
      success();
      onSuccess();
    } catch (err) {
      const message = getErrorMessage(err);

      if (typeof err === 'object' && err !== null && 'status' in err && err.status === 401) {
        setError('currentPassword', { type: 'server', message });
        return;
      }

      setError('root', { type: 'server', message });
    }
  };

  return (
    <form className={style['change-password-form']} onSubmit={handleSubmit(onSubmit)} noValidate>

      {errors.root && <Alert variant="error">{errors.root.message}</Alert>}

      <FormField
        label="Current password"
        type="password"
        icon={<RiLockPasswordLine />}
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />

      <FormField
        label="New password"
        type="password"
        icon={<RiShieldKeyholeLine />}
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
        label="Repeat new password"
        type="password"
        icon={<RiShieldCheckLine />}
        placeholder="Confirm your new password"
        autoComplete="new-password"
        error={errors.confirm?.message}
        {...register('confirm')}
      />

      <AuthFormActions onBack={onCancel} submitLabel="Update password" isLoading={isLoading} />
    </form>
  );
};
