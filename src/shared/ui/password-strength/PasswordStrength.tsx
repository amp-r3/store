import { PASSWORD_STRENGTH_LABELS } from '@/shared/lib';
import { usePasswordScore } from '@/shared/lib/hooks';
import style from './password-strength.module.scss';

interface PasswordStrengthProps {
  password: string;
}

const SEGMENT_COUNT = PASSWORD_STRENGTH_LABELS.length - 1;

export const PasswordStrength = ({ password }: PasswordStrengthProps) => {
  const score = usePasswordScore(password);

  if (!password) return null;

  const label = PASSWORD_STRENGTH_LABELS[score];

  return (
    <div className={style['password-strength']} data-score={score}>
      <div className={style['password-strength__track']} aria-hidden="true">
        {Array.from({ length: SEGMENT_COUNT }, (_, segment) => (
          <span
            key={segment}
            className={[
              style['password-strength__segment'],
              segment < score ? style['password-strength__segment--filled'] : '',
            ].filter(Boolean).join(' ')}
          />
        ))}
      </div>
      <span className={style['password-strength__label']} aria-live="polite">
        Strength: {label}
      </span>
    </div>
  );
};
