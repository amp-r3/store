import { SessionUser } from '@/entities/session';

export const getInitial = (user: SessionUser): string => {
    const name = user.firstName || user.lastName;
    if (name) return name.charAt(0).toUpperCase();
    if (user.username) return user.username.charAt(0).toUpperCase();
    return '?';
};

export const getDisplayName = (user: SessionUser): string => {
    if (user.firstName || user.lastName) {
        return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return `@${user.username}`;
};
