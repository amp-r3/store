import { Database } from '@/shared/api';
import { NotificationType } from './notificationSlice';

export type NotificationCategory = Database['public']['Enums']['notification_category'];

export interface CenterNotification {
    id: string;
    category: NotificationCategory;
    level: NotificationType;
    title: string;
    body: string | null;
    actionPath: string | null;
    isRead: boolean;
    createdAt: string;
}
