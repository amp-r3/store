import Skeleton from 'react-loading-skeleton'
import style from './product-purchase-box.module.scss'
import { AddToCartButtonSkeleton } from '@/components/common/AddToCartButton/AddToCartButtonSkeleton'

export const ProductPurchaseBoxSkeleton = () => {
  return (
    <div className={style['purchase-box']}>
      <div className={style['price-block']}>
        <Skeleton width={128} height={53} borderRadius={12} />
      </div>
      <div style={{ width: '160px' }}>
        <AddToCartButtonSkeleton size='large' />
      </div>
    </div>
  )
}
