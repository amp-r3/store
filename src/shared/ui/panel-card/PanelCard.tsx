import { ReactNode } from 'react';
import { Link } from 'react-router';

import style from './admin-panel-card.module.scss';

interface AdminPanelCardProps {
    title: string;
    /** A control rendered in the header, e.g. a period switcher. */
    action?: ReactNode;
    /** "View all" link to the panel's full page. */
    to?: string;
    children: ReactNode;
}

export const AdminPanelCard = ({ title, action, to, children }: AdminPanelCardProps) => (
    <section className={style['admin-panel-card']}>
        <header className={style['admin-panel-card__header']}>
            <h2 className={style['admin-panel-card__title']}>{title}</h2>
            <div className={style['admin-panel-card__controls']}>
                {action}
                {to && (
                    <Link to={to} className={style['admin-panel-card__view-all']}>
                        View all
                    </Link>
                )}
            </div>
        </header>

        <div className={style['admin-panel-card__body']}>{children}</div>
    </section>
);
