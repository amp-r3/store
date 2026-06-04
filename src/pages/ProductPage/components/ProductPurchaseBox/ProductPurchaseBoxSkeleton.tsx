import Skeleton from 'react-loading-skeleton'
import style from './product-purchase-box.module.scss'
import { AddToCartButtonSkeleton, QuickBuyButtonSkeleton } from '@/components/common'

export const ProductPurchaseBoxSkeleton = () => {
  return (
    <div className={style['purchase-box']}>
      <div className={style['price-section']}>
        <div className={style['price-info']}>
          <Skeleton width={80} height={12} />
          <div className={style['price-values']}>
            <Skeleton width={120} height={40} borderRadius={8} />
          </div>
        </div>
      </div>

      <div className={style['actions']}>
        <AddToCartButtonSkeleton />
        <QuickBuyButtonSkeleton />
      </div>
    </div>
  )
}
