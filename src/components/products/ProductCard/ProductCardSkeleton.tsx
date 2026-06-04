import Skeleton from 'react-loading-skeleton'
import style from './productCard.module.scss'


export const ProductCardSkeleton = () => {

  return (
    <article className={style.card}>
      <div className={style.card__body}>
        <Skeleton height={241} />
      </div>
      <div className={style.card__body}>
        <Skeleton width="130px" height="16px" />
        <Skeleton width="70px" height="12px" style={{ marginTop: 'auto' }} />
      </div>
      <div className={style.card__footer}>
        <div className={style.card__price_wrapper}>
          <Skeleton width="70px" height="22px" />
        </div>
        <div className={style.card__rating}>
          <Skeleton width="15px" height="15px" circle />
          <Skeleton width="45px" height="12px" />
        </div>
      </div>
    </article>
  )
}