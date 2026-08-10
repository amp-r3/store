import { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import {
  IoBagCheckOutline,
  IoBagRemoveOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
  IoClose,
} from 'react-icons/io5';
import type { ToastAction, ToastVariant } from './showToast';
import style from './toast.module.scss';

// No default glyph for 'info' — it's the quietest variant (system messages
// like "Signed out", "Cart synced"), and stayed text-only on purpose.
const DEFAULT_ICON: Partial<Record<ToastVariant, ReactNode>> = {
  added: <IoBagCheckOutline aria-hidden="true" />,
  removed: <IoBagRemoveOutline aria-hidden="true" />,
  success: <IoCheckmarkCircleOutline aria-hidden="true" />,
  warning: <IoWarningOutline aria-hidden="true" />,
  error: <IoAlertCircleOutline aria-hidden="true" />,
};

const VARIANT_CLASS: Record<ToastVariant, string> = {
  added: style['card--brand'],
  removed: style['card--brand'],
  info: style['card--brand'],
  success: style['card--success'],
  warning: style['card--warning'],
  error: style['card--error'],
};

interface ToastCardProps {
  variant: ToastVariant;
  text: string;
  description?: string;
  action?: ToastAction;
  icon?: ReactNode;
  durationMs: number;
  showTimer?: boolean;
  onDismiss(): void;
}

export const ToastCard = ({
  variant,
  text,
  description,
  action,
  icon,
  durationMs,
  showTimer,
  onDismiss,
}: ToastCardProps) => {
  const handleActionClick = () => {
    action?.onClick?.();
    onDismiss();
  };

  const resolvedIcon = icon ?? DEFAULT_ICON[variant];

  return (
    <div className={`${style.card} ${VARIANT_CLASS[variant]}`}>
      {resolvedIcon && <div className={style.card__icon}>{resolvedIcon}</div>}

      <div className={style.card__body}>
        <p className={style.card__title}>{text}</p>
        {description && <p className={style.card__description}>{description}</p>}
      </div>

      {action &&
        (action.to ? (
          <Link
            href={action.to}
            className={`${style.card__action} ${action.emphasis === 'ghost' ? style['card__action--ghost'] : ''}`}
            onClick={onDismiss}
          >
            {action.label}
          </Link>
        ) : (
          <button
            type="button"
            className={`${style.card__action} ${action.emphasis === 'ghost' ? style['card__action--ghost'] : ''}`}
            onClick={handleActionClick}
          >
            {action.label}
          </button>
        ))}

      <button
        type="button"
        className={style.card__close}
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        <IoClose aria-hidden="true" />
      </button>

      {showTimer && (
        <div
          className={style.card__timer}
          style={{ '--toast-duration': `${durationMs}ms` } as CSSProperties}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
