import Skeleton from 'react-loading-skeleton';
import style from './product-purchase-box.module.scss';
import { AddToCartButtonSkeleton, QuickBuyButtonSkeleton } from '@/components/common';

export const ProductPurchaseBoxSkeleton = () => {
  return (
    <div className={style['purchase-box']}>
      <div className={style['price-section']}>
        <div className={style['price-info']}>
          <span className={style['price-label']}>
            <Skeleton width={80} />
          </span>
          <div className={style['price-values']}>
            <span className={style['discount-price']}>
              <Skeleton width={120} />
            </span>
            <span className={style['original-price']}>
              <Skeleton width={60} />
            </span>
          </div>
        </div>

        <div
          className={style['discount-badge']}
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

      <div className={style['actions']}>
        <AddToCartButtonSkeleton className={style['add-to-cart']} />
        <QuickBuyButtonSkeleton className={style['quick-buy']} />
      </div>
    </div>
  );
};