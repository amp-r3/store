import { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { supabase, Database } from '@/shared/api';
import { CenterNotification } from '../model/types';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

const mapRow = (row: NotificationRow): CenterNotification => ({
    id: row.id,
    category: row.category,
    level: row.level,
    title: row.title,
    body: row.body,
    actionPath: row.action_path,
    isRead: row.is_read,
    createdAt: row.created_at,
});

export const subscribeToNotifications = (
    userId: string,
    onInsert: (notification: CenterNotification) => void
): (() => void) => {
    const channel = supabase
        .channel(`notifications-${userId}`)
        .on<NotificationRow>(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            },
            (payload: RealtimePostgresInsertPayload<NotificationRow>) => {
                onInsert(mapRow(payload.new));
            }
        )
        .subscribe();

    return () => {
        supabase.removeChannel(channel);
    };
};
