import { ReactNode } from 'react';
import { Link } from 'react-router';

import style from './stat-tile.module.scss';

export type StatTileSize = 'sm' | 'md';
export type StatTileLayout = 'row' | 'column';

export interface StatTileProps {
    /** A ready element, not an IconType — callers already own their icon choice. */
    icon: ReactNode;
    label: string;
    value: ReactNode;
    /** When set, the tile renders as a <Link>; otherwise a plain <article>. */
    to?: string;
    size?: StatTileSize;
    layout?: StatTileLayout;
}

export const StatTile = ({ icon, label, value, to, size = 'md', layout = 'row' }: StatTileProps) => {
    const className = [
        style['stat-tile'],
        style[`stat-tile--${layout}`],
        style[`stat-tile--${size}`],
        to ? style['stat-tile--linked'] : '',
    ].filter(Boolean).join(' ');

    const content = layout === 'row' ? (
        <>
            <div className={style['stat-tile__icon']} aria-hidden="true">{icon}</div>
            <div className={style['stat-tile__body']}>
                <span className={style['stat-tile__label']}>{label}</span>
                <span className={style['stat-tile__value']}>{value}</span>
            </div>
        </>
    ) : (
        <>
            <div className={style['stat-tile__top']}>
                <div className={style['stat-tile__icon']} aria-hidden="true">{icon}</div>
                <span className={style['stat-tile__value']}>{value}</span>
            </div>
            <span className={style['stat-tile__label']}>{label}</span>
        </>
    );

    if (to) {
        return <Link to={to} className={className}>{content}</Link>;
    }

    return <article className={className}>{content}</article>;
};
