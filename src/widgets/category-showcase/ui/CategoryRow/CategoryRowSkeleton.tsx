import Skeleton from 'react-loading-skeleton';
import { ProductCardSkeleton } from '@/entities/product';
import style from './category-row.module.scss';

const SKELETON_CARDS_COUNT = 4;

export const CategoryRowSkeleton = () => {
    return (
        <section className={style.categoryRow} aria-hidden="true">
            <Skeleton
                width="180px"
                height="28px"
                baseColor="var(--skeleton-base)"
                highlightColor="var(--skeleton-highlight)"
            />

            <div className={style.categoryRow__skeletonTrack}>
                {Array.from({ length: SKELETON_CARDS_COUNT }).map((_, index) => (
                    <div key={`row-skeleton-card-${index}`} className={style.categoryRow__item}>
                        <ProductCardSkeleton />
                    </div>
                ))}
            </div>
        </section>
    );
};
