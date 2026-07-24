import { LuBellOff } from 'react-icons/lu';
import {
    useGetNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
    NotificationCard,
    NotificationCardSkeleton,
} from '@/entities/notification';
import style from './user-notifications-page.module.scss';

export const UserNotificationsPage = () => {
    const { data: notifications, isLoading } = useGetNotificationsQuery();
    const [markRead] = useMarkNotificationReadMutation();
    const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

    const hasUnread = (notifications ?? []).some((notification) => !notification.isRead);

    return (
        <>
            <header className={style['user-notifications-page__content-header']}>
                <div className={style['user-notifications-page__heading']}>
                    <h1 className={style['user-notifications-page__title']}>Notifications</h1>
                    <p className={style['user-notifications-page__subtitle']}>
                        Order updates, review reminders and price drops on your wishlist.
                    </p>
                </div>
                <button
                    type="button"
                    className={style['user-notifications-page__mark-all']}
                    disabled={!hasUnread || isMarkingAll}
                    onClick={() => markAllRead()}
                >
                    Mark all as read
                </button>
            </header>

            <div className={style['user-notifications-page__content-body']}>
                {isLoading ? (
                    <NotificationCardSkeleton count={5} />
                ) : notifications && notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <NotificationCard
                            key={notification.id}
                            notification={notification}
                            onRead={markRead}
                        />
                    ))
                ) : (
                    <div className={style['user-notifications-page__empty']}>
                        <span className={style['user-notifications-page__empty-icon']} aria-hidden="true">
                            <LuBellOff />
                        </span>
                        <h3 className={style['user-notifications-page__empty-title']}>No notifications yet</h3>
                        <p className={style['user-notifications-page__empty-text']}>
                            Order updates, review reminders and price drops will show up here.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};
