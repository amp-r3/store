import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { RiLockPasswordLine, RiShieldCheckLine, RiShieldKeyholeLine } from 'react-icons/ri';
import { Alert, FormField, PasswordRequirements } from '@/shared/ui';
import { getErrorMessage, useHaptics } from '@/shared/lib';
import { useChangePasswordMutation } from '@/entities/session';
import { ChangePasswordSchema, changePasswordSchema } from '../../model/changePasswordSchema';
import { AuthFormActions } from '../auth-form-actions/AuthFormActions';
import style from './change-password-form.module.scss';

interface ChangePasswordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChangePasswordForm = ({ onSuccess, onCancel }: ChangePasswordFormProps) => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { success } = useHaptics();

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
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />

      <FormField
        label="New password"
        type="password"
        icon={<RiShieldKeyholeLine />}
        placeholder="At least 6 characters"
        error={!!errors.password}
        {...register('password')}
      />

      <PasswordRequirements
        password={passwordValue}
        showUnmetAsError={touchedFields.password || isSubmitted}
      />

      <FormField
        label="Repeat new password"
        type="password"
        icon={<RiShieldCheckLine />}
        placeholder="Confirm your new password"
        error={errors.confirm?.message}
        {...register('confirm')}
      />

      <AuthFormActions onCancel={onCancel} submitLabel="Update password" isLoading={isLoading} />
    </form>
  );
};
