import { LuArrowLeft } from 'react-icons/lu';
import { Button } from '@/shared/ui';
import style from './auth-form-actions.module.scss';

interface AuthFormActionsProps {
  /** Omit to render a full-width submit only (no step to go back to). */
  onBack?: () => void;
  submitLabel: string;
  isLoading: boolean;
}

export const AuthFormActions = ({ onBack, submitLabel, isLoading }: AuthFormActionsProps) => (
  <div className={style['auth-form-actions']}>
    {onBack && (
      <Button type="button" variant="ghost" onClick={onBack} disabled={isLoading}>
        <LuArrowLeft aria-hidden="true" />
        Back
      </Button>
    )}
    <Button type="submit" variant="primary" isLoading={isLoading}>
      {submitLabel}
    </Button>
  </div>
);
