import { memo } from 'react';
import { Loader } from '@/shared/ui';
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
  isLoading?: boolean;
  disabled?: boolean;
}

export const SignInButton = memo<SignInButtonProps>(
  ({ provider, className, onClick, hasFailed, isLoading, disabled }) => {
    const { label, icon, slug } = PROVIDER_CONFIG[provider];
    const buttonLabel = hasFailed ? `Try ${label} again` : `Continue with ${label}`;

    const buttonClasses = [
      style['sign-in'],
      style[`sign-in--${slug}`],
      hasFailed ? style['sign-in--failed'] : '',
      isLoading ? style['sign-in--loading'] : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        className={buttonClasses}
        type="button"
        aria-label={buttonLabel}
        aria-busy={isLoading || undefined}
        disabled={disabled || isLoading}
        onClick={onClick}
      >
        <span className={style['sign-in__icon']}>{isLoading ? <Loader size="xs" /> : icon}</span>

        <span className={style['sign-in__label']}>{buttonLabel}</span>
      </button>
    );
  },
);

SignInButton.displayName = 'SignInButton';
