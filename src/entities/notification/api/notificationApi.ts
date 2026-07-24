import { supabase, baseApi } from '@/shared/api';
import { getErrorMessage } from '@/shared/lib';
import { CenterNotification } from '../model/types';

const mapRow = (row: {
    id: string;
    category: CenterNotification['category'];
    level: CenterNotification['level'];
    title: string;
    body: string | null;
    action_path: string | null;
    is_read: boolean;
    created_at: string;
}): CenterNotification => ({
    id: row.id,
    category: row.category,
    level: row.level,
    title: row.title,
    body: row.body,
    actionPath: row.action_path,
    isRead: row.is_read,
    createdAt: row.created_at,
});

export const notificationApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getNotifications: builder.query<CenterNotification[], void>({
            async queryFn() {
                try {
                    const { data, error } = await supabase
                        .from('notifications')
                        .select('*')
                        .order('created_at', { ascending: false })
                        .limit(30);

                    if (error) {
                        return { error: { status: error.code, data: error.message } };
                    }

                    return { data: (data ?? []).map(mapRow) };
                } catch (error) {
                    return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
                }
            },
            providesTags: ['Notification'],
        }),

        getUnreadNotificationsCount: builder.query<number, void>({
            async queryFn() {
                try {
                    const { count, error } = await supabase
                        .from('notifications')
                        .select('id', { count: 'exact', head: true })
                        .eq('is_read', false);

                    if (error) {
                        return { error: { status: error.code, data: error.message } };
                    }

                    return { data: count ?? 0 };
                } catch (error) {
                    return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
                }
            },
            providesTags: ['Notification'],
        }),

        markNotificationRead: builder.mutation<null, string>({
            async queryFn(id) {
                try {
                    const { error } = await supabase
                        .from('notifications')
                        .update({ is_read: true })
                        .eq('id', id);

                    if (error) {
                        return { error: { status: error.code, data: error.message } };
                    }

                    return { data: null };
                } catch (error) {
                    return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
                }
            },
            async onQueryStarted(id, { dispatch, queryFulfilled }) {
                const patchList = dispatch(
                    notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
                        const item = draft.find((notification) => notification.id === id);
                        if (item) item.isRead = true;
                    })
                );
                const patchCount = dispatch(
                    notificationApi.util.updateQueryData('getUnreadNotificationsCount', undefined, (draft) => Math.max(draft - 1, 0))
                );

                try {
                    await queryFulfilled;
                } catch {
                    patchList.undo();
                    patchCount.undo();
                }
            },
        }),

        markAllNotificationsRead: builder.mutation<null, void>({
            async queryFn() {
                try {
                    const { data: { user }, error: authError } = await supabase.auth.getUser();
                    if (authError || !user) {
                        return { error: { status: 401, data: 'Not authorized' } };
                    }

                    const { error } = await supabase
                        .from('notifications')
                        .update({ is_read: true })
                        .eq('user_id', user.id)
                        .eq('is_read', false);

                    if (error) {
                        return { error: { status: error.code, data: error.message } };
                    }

                    return { data: null };
                } catch (error) {
                    return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
                }
            },
            invalidatesTags: ['Notification'],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useGetUnreadNotificationsCountQuery,
    useMarkNotificationReadMutation,
    useMarkAllNotificationsReadMutation,
} = notificationApi;
