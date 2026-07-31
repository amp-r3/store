import { memo, type ReactNode } from 'react';
import type { IconType } from 'react-icons';

import style from './admin-stat-card.module.scss';

interface AdminStatCardProps {
    label: string;
    value: ReactNode;
    icon: IconType;
}

export const AdminStatCard = memo(({ label, value, icon: Icon }: AdminStatCardProps) => (
    <article className={style['admin-stat-card']}>
        <div className={style['admin-stat-card__icon']}>
            <Icon />
        </div>
        <div className={style['admin-stat-card__body']}>
            <span className={style['admin-stat-card__label']}>{label}</span>
            <span className={style['admin-stat-card__value']}>{value}</span>
        </div>
    </article>
));

AdminStatCard.displayName = 'AdminStatCard';
