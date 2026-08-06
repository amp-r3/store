import { ReactNode } from 'react';
import Link from 'next/link';

import style from './empty-state.module.scss';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    text: string;
    cta?: {
        to: string;
        label: string;
    };
}

export const EmptyState = ({ icon, title, text, cta }: EmptyStateProps) => (
    <div className={style['empty-state']}>
        <span className={style['empty-state__icon']} aria-hidden="true">
            {icon}
        </span>
        <h3 className={style['empty-state__title']}>{title}</h3>
        <p className={style['empty-state__text']}>{text}</p>
        {cta && (
            <Link href={cta.to} className={style['empty-state__cta']}>
                {cta.label}
            </Link>
        )}
    </div>
);
