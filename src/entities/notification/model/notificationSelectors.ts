import { AppNotification, NotificationState } from './notificationSlice';

const OFFLINE_NOTIFICATION: AppNotification = {
    id: -1,
    type: 'warning',
    text: 'No internet connection',
    sticky: true,
};

export const selectNotification = (
    state: { notification: NotificationState }
): AppNotification | null =>
    state.notification.isOffline ? OFFLINE_NOTIFICATION : state.notification.current;
