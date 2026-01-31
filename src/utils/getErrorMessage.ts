import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

export const getErrorMessage = (error: FetchBaseQueryError | SerializedError): string => {
    if ('status' in error) {
        const errMsg = 'error' in error ? error.error : JSON.stringify(error.data);

        if (typeof error.data === 'object' && error.data !== null && 'message' in error.data) {
            return (error.data as any).message;
        }

        return errMsg || 'Неизвестная ошибка сервера';
    } else {
        return error.message || 'Произошла неизвестная ошибка';
    }
};