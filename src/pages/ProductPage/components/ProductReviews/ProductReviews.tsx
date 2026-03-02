import { ReviewCard, type Review } from './ReviewCard/ReviewCard';
import style from './product-reviews.module.scss';
import { FaComments } from 'react-icons/fa';

interface ProductReviewsProps {
    reviews: Review[];
}

export const ProductReviews = ({ reviews }: ProductReviewsProps) => {
    if (!reviews || reviews.length === 0) return null;

    return (
        <div id="reviews" className={style['reviews']}>
            <h2 className={style['reviews-title']}>
                <FaComments />
                <span>Reviews</span>
            </h2>
            <div className={style['reviews-list']}>
                {reviews.map((review, index) => (
                    <ReviewCard key={index} review={review} />
                ))}
            </div>
        </div>
    );
};