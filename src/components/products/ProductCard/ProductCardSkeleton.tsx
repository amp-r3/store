import Skeleton from 'react-loading-skeleton'
import style from './productCard.module.scss'
import { AddToCartButtonSkeleton } from '@/components/common'


export const ProductCardSkeleton = () => {

  return (
    <article className={style.card}>
      <div className={style.card__body}>
        <Skeleton height={241} />
      </div>
      <div className={style.card__body}>
        <Skeleton width={130} height={16} />

        <div className={style.card__meta}>
          <div className={style.card__rating}>
            <Skeleton width={15} height={15} circle />
            <Skeleton width={45} height={10} />
          </div>
          <Skeleton width={70} height={8} />
        </div>

      </div>
      <div className={style.card__footer}>
        <div className={style.card__price_wrapper}>
          <Skeleton width={70} height={22} />
        </div>
        <AddToCartButtonSkeleton size='small' />
      </div>
    </article>
  )
}