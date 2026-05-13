import { FcGoogle } from 'react-icons/fc';
import style from './sign-in-button.module.scss';

type Provider = 'Google';

interface SignInButtonProps {
  provider: Provider;
  onClick(): void;
  className?: string;
}

export const SignInButton = ({ provider, className, onClick }: SignInButtonProps) => {
  const label = `Continue with ${provider}`;

  const buttonClasses = [
    style['sign-in'],
    style[`sign-in--${provider.toLowerCase()}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={buttonClasses} type="button" aria-label={label} onClick={onClick}>
      <span className={style['sign-in__icon']}>
        <FcGoogle />
      </span>
      <span className={style['sign-in__label']}>
        {label}
      </span>
    </button>
  );
};