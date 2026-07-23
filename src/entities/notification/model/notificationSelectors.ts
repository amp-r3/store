import { createSelector } from '@reduxjs/toolkit';
import { AppNotification, NotificationState } from './notificationSlice';

const OFFLINE_NOTIFICATION: AppNotification = {
    id: -1,
    type: 'warning',
    text: 'No internet connection',
    sticky: true,
};

type NotificationRootState = { notification: NotificationState };

const selectNotificationState = (state: NotificationRootState) => state.notification;

export const selectNotification = (state: NotificationRootState): AppNotification | null =>
    state.notification.isOffline ? OFFLINE_NOTIFICATION : (state.notification.queue[0] ?? null);

export const selectPendingCount = createSelector(
    [selectNotificationState],
    (notification) => (notification.isOffline ? notification.queue.length : Math.max(notification.queue.length - 1, 0))
);
