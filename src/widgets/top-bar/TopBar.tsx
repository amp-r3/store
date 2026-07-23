import { useEffect } from 'react';
import { Link } from 'react-router';
import { IoClose } from 'react-icons/io5';
import {
  selectNotification,
  selectPendingCount,
  useOfflineNotifier,
  dismissNotification,
  AUTO_DISMISS_MS,
  NotificationType,
} from '@/entities/notification';
import { useAppDispatch, useAppSelector } from '@/shared/model';
import style from './top-bar.module.scss';

const DEFAULT_TEXT = 'Portfolio site: materials are not commercial.';

const TYPE_CLASS: Record<NotificationType, string> = {
  info: '',
  success: style['topbar--success'],
  warning: style['topbar--warning'],
  error: style['topbar--error'],
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
      notification.durationMs ?? AUTO_DISMISS_MS
    );

    return () => clearTimeout(timeoutId);
  }, [notification, dispatch]);

  const type = notification?.type ?? 'info';

  return (
    <header className={`${style.topbar} ${isOverlay ? style['topbar--overlay'] : ''} ${TYPE_CLASS[type]}`}>
      <div className={`${style.topbar__container} container`}>
        {pendingCount > 0 && (
          <button
            type="button"
            className={style.topbar__count}
            aria-label={`${pendingCount} more notification${pendingCount > 1 ? 's' : ''}`}
            onClick={() => notification && dispatch(dismissNotification(notification.id))}
          >
            +{pendingCount}
          </button>
        )}

        <p className={style.topbar__text} aria-live="polite">
          {notification?.text ?? DEFAULT_TEXT}
        </p>

        {notification?.action && (
          <Link to={notification.action.to} className={style.topbar__action}>
            {notification.action.label}
          </Link>
        )}

        {notification && notification.id !== -1 && (
          <button
            type="button"
            className={style.topbar__dismiss}
            aria-label="Dismiss notification"
            onClick={() => dispatch(dismissNotification(notification.id))}
          >
            <IoClose />
          </button>
        )}
      </div>
    </header>
  );
};
