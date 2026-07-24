import { memo } from 'react';
import { Link } from 'react-router';
import { CenterNotification } from '../../model/types';
import style from './notification-card.module.scss';

interface NotificationCardProps {
    notification: CenterNotification;
    onRead(id: string): void;
}

const formatDate = (iso: string): string =>
    new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export const NotificationCard = memo(({ notification, onRead }: NotificationCardProps) => {
    const { id, level, title, body, actionPath, isRead, createdAt } = notification;

    const content = (
        <>
            {!isRead && <span className={style.notificationCard__dot} aria-hidden="true" />}
            <div className={style.notificationCard__content}>
                <p className={style.notificationCard__title}>{title}</p>
                {body && <p className={style.notificationCard__body}>{body}</p>}
                <span className={style.notificationCard__date}>{formatDate(createdAt)}</span>
            </div>
        </>
    );

    const className = `${style.notificationCard} ${style[`notificationCard--${level}`]} ${isRead ? style['notificationCard--read'] : ''}`;

    if (actionPath) {
        return (
            <Link to={actionPath} className={className} onClick={() => !isRead && onRead(id)}>
                {content}
            </Link>
        );
    }

    return (
        <article
            className={className}
            role={!isRead ? 'button' : undefined}
            tabIndex={!isRead ? 0 : undefined}
            onClick={() => !isRead && onRead(id)}
            onKeyDown={(e) => {
                if (isRead) return;
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRead(id);
                }
            }}
        >
            {content}
        </article>
    );
});

NotificationCard.displayName = 'NotificationCard';
