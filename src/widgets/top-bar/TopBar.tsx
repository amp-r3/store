import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import {
  IoClose,
  IoInformationCircleOutline,
  IoCheckmarkCircleOutline,
  IoWarningOutline,
  IoAlertCircleOutline,
} from 'react-icons/io5';
import {
  selectNotification,
  selectPendingCount,
  useOfflineNotifier,
  dismissNotification,
  AUTO_DISMISS_MS,
  NotificationType,
} from '@/entities/notification';
import { useAppDispatch, useAppSelector } from '@/shared/model';
import { useSwipeDismiss } from '@/shared/lib/hooks';
import style from './top-bar.module.scss';

const TYPE_CLASS: Record<NotificationType, string> = {
  info: style['topbar--info'],
  success: style['topbar--success'],
  warning: style['topbar--warning'],
  error: style['topbar--error'],
};

const TYPE_ICON: Record<NotificationType, ReactNode> = {
  info: <IoInformationCircleOutline aria-hidden="true" />,
  success: <IoCheckmarkCircleOutline aria-hidden="true" />,
  warning: <IoWarningOutline aria-hidden="true" />,
  error: <IoAlertCircleOutline aria-hidden="true" />,
};

interface TopBarProps {
  isOverlay?: boolean;
}

export const TopBar = ({ isOverlay = false }: TopBarProps) => {
  const dispatch = useAppDispatch();
  const notification = useAppSelector(selectNotification);
  const pendingCount = useAppSelector(selectPendingCount);
  useOfflineNotifier();

  useEffect(() => {
    if (!notification || notification.sticky) return;
    if (notification.type === 'error' || notification.type === 'warning') return;

    const timeoutId = setTimeout(
      () => dispatch(dismissNotification(notification.id)),
      notification.durationMs ?? AUTO_DISMISS_MS,
    );

    return () => clearTimeout(timeoutId);
  }, [notification, dispatch]);

  // Toggles a var the rest of the layout (navbar, checkout summary, toast
  // viewport) reads to reserve/release the bar's height — the bar itself no
  // longer has a permanent idle state, so nothing can hardcode that offset.
  useEffect(() => {
    if (!notification) return;

    document.documentElement.dataset.topbar = 'true';
    return () => {
      delete document.documentElement.dataset.topbar;
    };
  }, [notification]);

  // The offline sticky notification (id -1) has no dismiss button either —
  // it shouldn't disappear on a swipe by accident.
  const isDismissible = !!notification && notification.id !== -1;

  const { ref: swipeRef, bind: bindSwipe } = useSwipeDismiss({
    direction: 'up',
    onDismiss: () => notification && dispatch(dismissNotification(notification.id)),
    disabled: !isDismissible,
  });

  if (!notification) return null;

  return (
    <header
      // Forces a fresh DOM node per notification — otherwise a swiped-away
      // (translated, faded) bar would carry that inline style straight into
      // the next notification that reuses the same <header>.
      key={notification.id}
      ref={swipeRef}
      {...bindSwipe()}
      className={`${style.topbar} ${isOverlay ? style['topbar--overlay'] : ''} ${TYPE_CLASS[notification.type]}`}
    >
      <div className={`${style.topbar__container} container`}>
        {pendingCount > 0 && (
          <button
            type="button"
            className={style.topbar__count}
            aria-label={`${pendingCount} more notification${pendingCount > 1 ? 's' : ''}`}
            onClick={() => dispatch(dismissNotification(notification.id))}
          >
            +{pendingCount}
          </button>
        )}

        <span className={style.topbar__icon}>{TYPE_ICON[notification.type]}</span>

        <p className={style.topbar__text} aria-live="polite">
          {notification.text}
        </p>

        {notification.action && (
          <Link href={notification.action.to} className={style.topbar__action}>
            {notification.action.label}
          </Link>
        )}

        {isDismissible && (
          <button
            type="button"
            className={style.topbar__dismiss}
            aria-label="Dismiss notification"
            onClick={() => dispatch(dismissNotification(notification.id))}
          >
            <IoClose aria-hidden="true" />
          </button>
        )}
      </div>
    </header>
  );
};
