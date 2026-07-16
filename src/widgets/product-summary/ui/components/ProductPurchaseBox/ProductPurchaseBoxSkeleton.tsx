import Skeleton from 'react-loading-skeleton';
import style from './product-purchase-box.module.scss';
import { AddToCartButtonSkeleton, QuickBuyButtonSkeleton } from "@/features/cart-actions";

export const ProductPurchaseBoxSkeleton = () => {
    return (
        <div className={style['purchase-box']}>
            <div className={style['purchase-box__price-section']}>
                <div className={style['purchase-box__price-info']}>
                    <span className={style['purchase-box__price-label']}>
                        <Skeleton width={80} />
                    </span>
                    <div className={style['purchase-box__price-values']}>
                        <span className={style['purchase-box__discount-price']}>
                            <Skeleton width={120} />
                        </span>
                        <span className={style['purchase-box__original-price']}>
                            <Skeleton width={60} />
                        </span>
                    </div>
                </div>

                <div
                    className={style['purchase-box__discount-badge']}
                    style={{
                        background: 'transparent',
                        borderColor: 'transparent',
                        boxShadow: 'none',
                        padding: 0,
                    }}
                >
                    <Skeleton width={90} height={28} borderRadius="var(--radius-pill)" style={{ display: 'block' }} />
                </div>
            </div>

            <div className={style['purchase-box__actions']}>
                <AddToCartButtonSkeleton className={style['purchase-box__add-to-cart']} />
                <QuickBuyButtonSkeleton className={style['purchase-box__quick-buy']} />
            </div>
        </div>
    );
};
