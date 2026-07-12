import Skeleton from 'react-loading-skeleton';
import style from './product-sizes.module.scss';

export interface ProductSizesSkeletonProps {
    isCompact?: boolean;
}

export const ProductSizesSkeleton = ({ isCompact = false }: ProductSizesSkeletonProps) => {
    const containerClassName = isCompact
        ? `${style['product-sizes']} ${style['product-sizes--compact']}`
        : style['product-sizes'];

    return (
        <div className={containerClassName}>
            <span className={style['product-sizes__title']}>
                <Skeleton 
                    width={80} 
                    height={16} 
                    baseColor="var(--skeleton-base)" 
                    highlightColor="var(--skeleton-highlight)" 
                />
            </span>
            <div className={style['product-sizes__list']}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className={style['product-sizes__skeleton-item']}>
                        <Skeleton
                            width="100%"
                            height="100%"
                            borderRadius="var(--radius-sm)"
                            baseColor="var(--skeleton-base)"
                            highlightColor="var(--skeleton-highlight)"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
