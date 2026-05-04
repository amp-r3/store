import Skeleton from 'react-loading-skeleton'
import { ReviewCardSkeleton } from './ReviewCard/ReviewCardSkeketon'
import style from './product-reviews.module.scss'
import { FaComments } from 'react-icons/fa'

export const ProductReviewsSkeleton = () => {
  return (
    <div id="reviews" className={style['reviews']}>
      <div className={style['reviews-header']}>
        <h2 className={style['reviews-title']}>
          <FaComments />
          <span>Reviews</span>
        </h2>
        
        <Skeleton width={26} height={19} circle />
      </div>
      <div className={style['reviews-list']}>
        {
          Array.from({ length: 4 }).map((_, i) => (
            <ReviewCardSkeleton key={i} />
          ))
        }
      </div>
    </div>
  )
}