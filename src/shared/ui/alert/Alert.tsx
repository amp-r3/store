import { ReactNode, forwardRef } from 'react';
import style from './alert.module.scss';

export type AlertVariant = 'error' | 'warning' | 'success' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  icon?: ReactNode;
  children: ReactNode;
  /** Set to -1 to allow programmatically focusing the alert (e.g. moving
   *  focus to a form-level error on submit). */
  tabIndex?: number;
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'error', icon, children, tabIndex }, ref) => (
    <div
      ref={ref}
      tabIndex={tabIndex}
      className={`${style.alert} ${style[`alert--${variant}`]}`}
      role="alert"
    >
      <span className={style.alert__icon}>{icon ?? '!'}</span>
      <span className={style.alert__text}>{children}</span>
    </div>
  ),
);

Alert.displayName = 'Alert';
