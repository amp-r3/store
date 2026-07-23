import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationAction {
    label: string;
    to: string;
}

export interface AppNotification {
    id: number;
    type: NotificationType;
    text: string;
    sticky?: boolean;
    key?: string;
    action?: NotificationAction;
    durationMs?: number;
}

export interface NotificationState {
    queue: AppNotification[];
    isOffline: boolean;
    nextId: number;
}

export const AUTO_DISMISS_MS = 4000;
const MAX_QUEUE = 5;

const initialState: NotificationState = {
    queue: [],
    isOffline: false,
    nextId: 1,
};

export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        notify: (
            state,
            action: PayloadAction<{
                type: NotificationType;
                text: string;
                sticky?: boolean;
                key?: string;
                action?: NotificationAction;
                durationMs?: number;
            }>
        ) => {
            const notification: AppNotification = { id: state.nextId++, ...action.payload };

            const existingIndex = notification.key
                ? state.queue.findIndex((item) => item.key === notification.key)
                : -1;

            if (existingIndex !== -1) {
                state.queue[existingIndex] = notification;
                return;
            }

            state.queue.push(notification);

            if (state.queue.length > MAX_QUEUE) {
                const oldestRemovableIndex = state.queue.findIndex((item) => !item.sticky);
                if (oldestRemovableIndex !== -1) {
                    state.queue.splice(oldestRemovableIndex, 1);
                }
            }
        },
        dismissNotification: (state, action: PayloadAction<number>) => {
            state.queue = state.queue.filter((item) => item.id !== action.payload);
        },
        clearNotifications: (state) => {
            state.queue = [];
        },
        setOffline: (state, action: PayloadAction<boolean>) => {
            state.isOffline = action.payload;
        },
    },
});

export const { notify, dismissNotification, clearNotifications, setOffline } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
export default notificationSlice.reducer;
