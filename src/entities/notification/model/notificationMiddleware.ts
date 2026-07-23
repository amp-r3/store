import { isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import { getErrorMessage } from '@/shared/lib';
import { notify } from './notificationSlice';

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

    return next(action);
};
