import { ReactNode } from 'react';
import style from './alert.module.scss';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  icon?: ReactNode;
  children: ReactNode;
}

export const Alert = ({ variant = 'error', icon, children }: AlertProps) => (
  <div className={`${style.alert} ${style[`alert--${variant}`]}`} role="alert">
    <span className={style.alert__icon}>{icon ?? '!'}</span>
    <span className={style.alert__text}>{children}</span>
  </div>
);
