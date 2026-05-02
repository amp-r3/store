import Skeleton from 'react-loading-skeleton'
import styles from './cart-item.module.scss'
export const CartItemSkeleton = () => {
  return (
    <article className={styles['cart-item']}>
      <Skeleton width={110} height={110} borderRadius={12} />
      <div className={styles['cart-item__content']}>

        <div className={styles['cart-item__header']}>
          <Skeleton width={130} height={16} borderRadius={999} />

          <div className={styles['cart-item__price-group']}>
            <Skeleton width={60} height={16} borderRadius={999} />
          </div>
        </div>
      </div>
    </article>
  )
}