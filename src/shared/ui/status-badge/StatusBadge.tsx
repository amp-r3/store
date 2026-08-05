import { ReactNode } from 'react';

import style from './status-badge.module.scss';

interface StatusBadgeProps {
    /** Raw enum value (order/payment/delivery status) — drives the color via data-status. */
    status: string;
    label: string;
    compact?: boolean;
    icon?: ReactNode;
    ariaLabel?: string;
    className?: string;
}

export const StatusBadge = ({ status, label, compact, icon, ariaLabel, className }: StatusBadgeProps) => (
    <span
        className={`${style.badge} ${compact ? style.badgeCompact : ''} ${className ?? ''}`}
        data-status={status}
        aria-label={ariaLabel}
    >
        {icon}
        {label}
    </span>
);
