import { LuBellOff } from 'react-icons/lu';
import {
    useGetNotificationsQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
    NotificationCard,
    NotificationCardSkeleton,
} from '@/entities/notification';
import { EmptyState, SectionHeader } from '@/shared/ui';
import style from './user-notifications-page.module.scss';

export const UserNotificationsPage = () => {
    const { data: notifications, isLoading } = useGetNotificationsQuery();
    const [markRead] = useMarkNotificationReadMutation();
    const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllNotificationsReadMutation();

    const hasUnread = (notifications ?? []).some((notification) => !notification.isRead);

    return (
        <>
            <SectionHeader
                title="Notifications"
                subtitle="Order updates, review reminders and price drops on your wishlist."
                action={
                    <button
                        type="button"
                        className={style['user-notifications-page__mark-all']}
                        disabled={!hasUnread || isMarkingAll}
                        onClick={() => markAllRead()}
                    >
                        Mark all as read
                    </button>
                }
            />

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
                    <EmptyState
                        icon={<LuBellOff />}
                        title="No notifications yet"
                        text="Order updates, review reminders and price drops will show up here."
                    />
                )}
            </div>
        </>
    );
};
