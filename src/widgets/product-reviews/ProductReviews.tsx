import { FaComments } from 'react-icons/fa';

import { ReviewsStats } from '@/entities/review/ui/reviews-stats/ReviewsStats';
import { ReviewsControls } from '@/entities/review/ui/reviews-controls/ReviewsControls';
import { ReviewsSort } from '@/features/product-reviews-sort';
import style from './product-reviews.module.scss';
import ProductReviewsSkeleton from './ProductReviewsSkeleton';
import { ReviewCard } from '@/entities/review';
import { ProductReview } from "@/entities/review";
import { useProductReviews } from "@/entities/review";

interface ProductReviewsProps {
    reviews: ProductReview[];
    rating: number;
}

export const ProductReviews = ({ reviews, rating }: ProductReviewsProps) => {
    const { sortedReviews, user } = useProductReviews(reviews);

    if (!reviews) return <ProductReviewsSkeleton />;

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
                <ReviewsStats reviews={reviews} rating={rating} />

                {/* Right Column: Controls and Reviews List */}
                <div className={style['reviews__list-panel']}>
                    <ReviewsControls sortSlot={<ReviewsSort />} />
                        {sortedReviews.length === 0 ? (
                            <div className={style['reviews__empty']}>No reviews yet. Be the first to write one!</div>
                        ) : (
                            <div className={style['reviews__list']} aria-live="polite">
                                {sortedReviews.map((review) => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        isCurrentUser={user?.id === review.userId}
                                    />
                                ))}
                            </div>
                        )}
                </div>
            </div>
        </section>
    );
};