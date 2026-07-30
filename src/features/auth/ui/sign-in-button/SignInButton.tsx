import style from './sign-in-button.module.scss';
import { PROVIDER_CONFIG, type AuthProviderId } from '@/shared/config';

interface SignInButtonProps {
  provider: AuthProviderId;
  onClick(): void;
  className?: string;
  /** A previous attempt with this provider failed this session — style it as
   *  a retry rather than disabling it outright, since a transient failure
   *  (cancelled consent, network blip) shouldn't lock the provider out for
   *  the rest of the session with no way back in. */
  hasFailed?: boolean;
}

export const SignInButton = ({
  provider,
  className,
  onClick,
  hasFailed,
}: SignInButtonProps) => {
  const { label, icon, slug } = PROVIDER_CONFIG[provider];
  const buttonLabel = hasFailed ? `Try ${label} again` : `Continue with ${label}`;

  const buttonClasses = [
    style['sign-in'],
    style[`sign-in--${slug}`],
    hasFailed ? style['sign-in--failed'] : '',
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
