import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import type { StatTileLayout, StatTileSize } from './StatTile';
import style from './stat-tile.module.scss';

interface StatTileSkeletonProps {
    count?: number;
    size?: StatTileSize;
    layout?: StatTileLayout;
}

export const StatTileSkeleton = ({ count = 1, size = 'md', layout = 'row' }: StatTileSkeletonProps) => {
    const iconSize = size === 'sm' ? 36 : 44;
    const className = [style['stat-tile'], style[`stat-tile--${layout}`], style[`stat-tile--${size}`]].join(' ');

    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className={className} style={{ pointerEvents: 'none' }}>
                    {layout === 'row' ? (
                        <>
                            <Skeleton circle width={iconSize} height={iconSize} />
                            <div className={style['stat-tile__body']}>
                                <Skeleton width={80} height={14} />
                                <Skeleton width={60} height={22} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={style['stat-tile__top']}>
                                <Skeleton circle width={iconSize} height={iconSize} />
                                <Skeleton width={50} height={24} />
                            </div>
                            <Skeleton width={90} height={14} />
                        </>
                    )}
                </div>
            ))}
        </>
    );
};
