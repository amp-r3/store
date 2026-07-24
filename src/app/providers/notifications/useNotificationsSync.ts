import { useEffect } from 'react';
import { baseApi } from '@/shared/api';
import { useAppDispatch, useAppSelector } from '@/shared/model';
import { selectUser } from '@/entities/session';
import { notify, subscribeToNotifications } from '@/entities/notification';

export const useNotificationsSync = () => {
    const dispatch = useAppDispatch();
    const userId = useAppSelector(selectUser)?.id;

    useEffect(() => {
        if (!userId) return;

        const unsubscribe = subscribeToNotifications(userId, (notification) => {
            dispatch(notify({
                type: notification.level,
                text: notification.title,
                key: `center-${notification.id}`,
                action: notification.actionPath ? { label: 'View', to: notification.actionPath } : undefined,
            }));
            dispatch(baseApi.util.invalidateTags(['Notification']));
        });

        return unsubscribe;
    }, [userId, dispatch]);
};
