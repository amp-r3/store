import { Button } from '@/shared/ui';
import style from './auth-form-actions.module.scss';

interface AuthFormActionsProps {
  onCancel: () => void;
  submitLabel: string;
  isLoading: boolean;
}

export const AuthFormActions = ({ onCancel, submitLabel, isLoading }: AuthFormActionsProps) => (
  <div className={style['auth-form-actions']}>
    <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
      Cancel
    </Button>
    <Button type="submit" variant="primary" isLoading={isLoading}>
      {submitLabel}
    </Button>
  </div>
);
