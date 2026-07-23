import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface AppNotification {
    id: number;
    type: NotificationType;
    text: string;
    sticky?: boolean;
}

export interface NotificationState {
    current: AppNotification | null;
    isOffline: boolean;
}

export const AUTO_DISMISS_MS = 4000;

const initialState: NotificationState = {
    current: null,
    isOffline: false,
};

let nextId = 1;

export const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        notify: (
            state,
            action: PayloadAction<{ type: NotificationType; text: string; sticky?: boolean }>
        ) => {
            state.current = { id: nextId++, ...action.payload };
        },
        dismissNotification: (state, action: PayloadAction<number>) => {
            if (state.current?.id === action.payload) {
                state.current = null;
            }
        },
        setOffline: (state, action: PayloadAction<boolean>) => {
            state.isOffline = action.payload;
        },
    },
});

export const { notify, dismissNotification, setOffline } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
export default notificationSlice.reducer;
