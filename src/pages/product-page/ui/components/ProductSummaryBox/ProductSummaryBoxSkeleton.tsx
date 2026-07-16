import style from './product-summary-box.module.scss';
import { ProductSizesSkeleton } from '../ProductSizes/ProductSizesSkeleton';
import { ProductInfoSkeleton, ProductPurchaseBoxSkeleton } from './components';

export const ProductSummaryBoxSkeleton = () => {
    return (
        <div className={style['summary-box']}>
            <div className={style['summary-box__top']}>
                <ProductInfoSkeleton />

                <div className={style['summary-box__sizes-container']}>
                    <ProductSizesSkeleton />
                </div>
            </div>

            <div className={style['summary-box__bottom']}>
                <ProductPurchaseBoxSkeleton />
            </div>
        </div>
    );
};
