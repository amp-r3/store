import { FaComments } from 'react-icons/fa';
import { ReviewCard, type Review } from './ReviewCard/ReviewCard';
import { ReviewsStats } from './ReviewsStats/ReviewsStats';
import { ReviewsControls } from './ReviewsControls/ReviewsControls';
import style from './product-reviews.module.scss';

interface ProductReviewsProps {
    reviews: Review[];
}

export const ProductReviews = ({ reviews }: ProductReviewsProps) => {
    if (!reviews || reviews.length === 0) return null;

    return (
        <section id="reviews" className={style['reviews']}>
            <div className={style['reviews__header']}>
                <h2 className={style['reviews__title']}>
                    <FaComments className={style['reviews__title-icon']} />
                    <span>Customer Feedback</span>
                </h2>
                <span className={style['reviews__count-badge']}>
                    {reviews.length} total
                </span>
            </div>

            <div className={style['reviews__layout']}>
                {/* Decomposed Left Column: Rating Statistics Summary */}
                <ReviewsStats />

                {/* Right Column: Controls and Reviews List */}
                <div className={style['reviews__list-panel']}>
                    {/* Decomposed Row: Filters Bar and Sorting Dropdown */}
                    <ReviewsControls />

                    <div className={style['reviews__list']}>
                        {reviews.map((review, index) => (
                            <ReviewCard key={index} review={review} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};