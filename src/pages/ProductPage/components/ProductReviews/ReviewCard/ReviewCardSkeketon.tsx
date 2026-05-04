import Skeleton from 'react-loading-skeleton'
import style from './review-card.module.scss'
export const ReviewCardSkeleton = () => {
  return (
    <div className={style['review-card']}>
      <div className={style['review-header']}>
        <span className={style['review-author']}>
          <Skeleton width={130} />
        </span>

        <div className={style['review-rating']}>
          <Skeleton width={80} height={16} />
        </div>
      </div>

      <div className={style['review-meta']}>
        <Skeleton circle width={14} height={14} />

        <span style={{ marginLeft: '8px' }}>
          <Skeleton width={85} />
        </span>
      </div>

      <p className={style['review-comment']}>
        <Skeleton count={3} />
      </p>
    </div>
  )
}