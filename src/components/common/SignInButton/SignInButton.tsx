import { FcGoogle } from 'react-icons/fc';
import { FaRegEnvelope, FaTelegram } from 'react-icons/fa';
import style from './sign-in-button.module.scss';
import { ReactNode } from 'react';

type Provider = 'Google' | 'Email' | 'Telegram';

interface SignInButtonProps {
  provider: Provider;
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
  const label = `Continue with ${provider}`;

  const buttonClasses = [
    style['sign-in'],
    style[`sign-in--${provider.toLowerCase()}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  let icon: ReactNode

  icon =
    provider === 'Google' ? <FcGoogle /> :
      provider === 'Email' ? <FaRegEnvelope /> :
        <FaTelegram color="#2AABEE" />;

  return (
    <button
      className={buttonClasses}
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      <span className={style['sign-in__icon']}>
        {icon}
      </span>

      <span className={style['sign-in__label']}>
        {label}
      </span>
    </button>
  );
};