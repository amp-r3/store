import { useEffect } from 'react';
import { useAppDispatch } from '@/shared/model';
import { notify, setOffline } from './notificationSlice';

export const useOfflineNotifier = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const handleOffline = () => dispatch(setOffline(true));
        const handleOnline = () => {
            dispatch(setOffline(false));
            dispatch(notify({ type: 'success', text: 'Connection restored' }));
        };

        if (!navigator.onLine) {
            dispatch(setOffline(true));
        }

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, [dispatch]);
};
