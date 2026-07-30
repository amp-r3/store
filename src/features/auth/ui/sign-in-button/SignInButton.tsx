import style from './sign-in-button.module.scss';
import { PROVIDER_CONFIG, type AuthProviderId } from '@/shared/config';

interface SignInButtonProps {
  provider: AuthProviderId;
  onClick(): void;
  className?: string;
  disabled?: boolean;
}

export const SignInButton = ({
  provider,
  className,
  onClick,
  disabled,
}: SignInButtonProps) => {
  const { label, icon, slug } = PROVIDER_CONFIG[provider];
  const buttonLabel = `Continue with ${label}`;

  const buttonClasses = [
    style['sign-in'],
    style[`sign-in--${slug}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClasses}
      type="button"
      aria-label={buttonLabel}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={style['sign-in__icon']}>
        {icon}
      </span>

      <span className={style['sign-in__label']}>
        {buttonLabel}
      </span>
    </button>
  );
};
