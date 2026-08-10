import { ButtonHTMLAttributes, forwardRef } from 'react';

import { Loader } from '../loader/Loader';
import style from './button.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading, disabled, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={[style.button, style[variant], className].filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader size="sm" /> : children}
    </button>
  ),
);

Button.displayName = 'Button';
