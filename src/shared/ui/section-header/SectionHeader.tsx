import { ReactNode } from 'react';

import style from './section-header.module.scss';

interface SectionHeaderProps {
    title: ReactNode;
    subtitle: ReactNode;
    action?: ReactNode;
}

export const SectionHeader = ({ title, subtitle, action }: SectionHeaderProps) => (
    <header className={style['section-header']}>
        <div className={style['section-header__heading']}>
            <h1 className={style['section-header__title']}>{title}</h1>
            <p className={style['section-header__subtitle']}>{subtitle}</p>
        </div>
        {action}
    </header>
);
