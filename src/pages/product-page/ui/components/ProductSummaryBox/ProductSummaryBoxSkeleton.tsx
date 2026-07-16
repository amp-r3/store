import style from './product-summary-box.module.scss';
import { ProductSizesSkeleton } from '../ProductSizes/ProductSizesSkeleton';
import { useMediaQuery } from "@/shared/lib/hooks";
import { ProductInfoSkeleton, ProductPurchaseBoxSkeleton } from './components';

export const ProductSummaryBoxSkeleton = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');

    return (
        <div className={style['summary-box']}>
            <div className={style['summary-box__top']}>
                <ProductInfoSkeleton />

                <div className={style['summary-box__sizes-container']}>
                    <ProductSizesSkeleton isCompact={!isMobile} />
                </div>
            </div>

            <div className={style['summary-box__bottom']}>
                <ProductPurchaseBoxSkeleton />
            </div>
        </div>
    );
};
