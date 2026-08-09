import { useEffect } from 'react';
import { useAppDispatch } from '@/shared/model';
// Deep import, not the `@/shared/ui` barrel — this module is reachable from
// `app/store.ts` via `entities/notification`'s index.ts (also evaluated in
// the Node server process), and the barrel would pull the whole UI kit into
// that graph for one function.
import { showToast } from '@/shared/ui/toast';
import { setOffline } from './notificationSlice';

export const useOfflineNotifier = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        const handleOffline = () => dispatch(setOffline(true));
        const handleOnline = () => {
            dispatch(setOffline(false));
            showToast('success', 'Connection restored');
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
