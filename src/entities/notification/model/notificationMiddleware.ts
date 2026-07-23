import { isFulfilled, isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/shared/lib';
import { clearNotifications, notify, NotificationType } from './notificationSlice';

// Endpoints whose rejection is already surfaced locally (forms/pages) —
// skip them here to avoid a duplicate error alongside the local one.
const LOCALLY_HANDLED_ENDPOINTS = new Set([
    'login',
    'register',
    'signInWithGoogle',
    'signInWithTelegram',
    'updateProfile',
    'deleteAccount',
    'createOrder',
    'addOrUpdateReview',
    'deleteReview',
    'toggleReviewLike',
]);

interface SuccessNotification {
    type: NotificationType;
    text: string;
    key?: string;
    action?: { label: string; to: string };
}

// Endpoints whose fulfilled result should surface a notification. `signOut`
// is handled separately below since it also needs to clear the queue.
const SUCCESS_MESSAGES: Record<string, SuccessNotification> = {
    login: { type: 'success', text: 'Signed in', key: 'auth' },
    register: { type: 'success', text: 'Account created', key: 'auth' },
    updateProfile: { type: 'success', text: 'Profile updated', key: 'profile' },
    deleteAccount: { type: 'info', text: 'Account deleted', key: 'auth' },
    addOrUpdateReview: {
        type: 'success',
        text: 'Review submitted',
        key: 'review',
        action: { label: 'View', to: '/user/reviews' },
    },
    deleteReview: { type: 'info', text: 'Review deleted', key: 'review' },
    syncCart: { type: 'success', text: 'Cart synced to your account', key: 'sync-cart' },
    syncWishlist: { type: 'success', text: 'Wishlist synced to your account', key: 'sync-wishlist' },
};

interface RtkQueryActionMeta {
    arg?: {
        type?: 'query' | 'mutation';
        endpointName?: string;
    };
}

export const notificationMiddleware: Middleware = (api) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        const meta = action.meta as RtkQueryActionMeta;
        const isUnhandledMutation =
            meta.arg?.type === 'mutation' &&
            !LOCALLY_HANDLED_ENDPOINTS.has(meta.arg.endpointName ?? '');

        if (isUnhandledMutation) {
            api.dispatch(notify({ type: 'error', text: getErrorMessage(action.payload) }));
        }
    }

    if (isFulfilled(action)) {
        const meta = action.meta as RtkQueryActionMeta;

        if (meta.arg?.type === 'mutation' && meta.arg.endpointName === 'signOut') {
            api.dispatch(clearNotifications());
            api.dispatch(notify({ type: 'info', text: 'Signed out' }));
        } else if (meta.arg?.type === 'mutation') {
            const successNotification = SUCCESS_MESSAGES[meta.arg.endpointName ?? ''];
            if (successNotification) {
                api.dispatch(notify(successNotification));
            }
        }
    }

    return next(action);
};
