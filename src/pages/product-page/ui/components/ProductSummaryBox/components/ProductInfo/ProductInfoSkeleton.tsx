import Skeleton from 'react-loading-skeleton';
import style from './product-info.module.scss';

export const ProductInfoSkeleton = () => {
    return (
        <div className={style['info-container']}>
            <div className={style['meta']}>
                <Skeleton width={132} height={33} borderRadius={999} />
                <span className={style['meta-divider']}></span>
                <Skeleton width={32} height={13} />
            </div>
            <h1 className={style['title']}><Skeleton width='70%' borderRadius={12} /></h1>
            <Skeleton width={123} height={26} borderRadius={999} />
        </div>
    );
};
