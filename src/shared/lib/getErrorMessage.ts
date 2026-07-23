import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null && 'status' in error) {
        const rtkError = error as FetchBaseQueryError;

        if (typeof rtkError.data === 'string') {
            return rtkError.data;
        }

        if (
            typeof rtkError.data === 'object' &&
            rtkError.data !== null &&
            'message' in rtkError.data &&
            typeof rtkError.data.message === 'string'
        ) {
            return rtkError.data.message;
        }

        const errMsg = 'error' in rtkError ? rtkError.error : JSON.stringify(rtkError.data);
        return errMsg || 'Unknown server error';
    }

    if (error instanceof Error) {
        return error.message || 'An unknown error occurred';
    }

    if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        return error.message || 'An unknown error occurred';
    }

    return 'An unknown error occurred';
};