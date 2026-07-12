import { FaRegStar, FaStar } from 'react-icons/fa';
import style from './reviews-stats.module.scss';
import { FC } from 'react';
import { useHaptics } from "@/shared/lib/hooks";
import { calculateRatingStats } from "@/entities/review";
import { ProductReview } from "@/entities/review";

interface ReviewStatsProps {
    reviews: ProductReview[];
    rating: number;
}

export const ReviewsStats: FC<ReviewStatsProps> = ({ reviews, rating }) => {
    const { light } = useHaptics();

    const totalReviews = reviews.length;
    const distribution = calculateRatingStats(reviews)
    const handleRowClick = () => {
        light();
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? (
                <FaStar key={i} className={style['reviews-stats__average-star']} />
            ) : (
                <FaRegStar key={i} className={style['reviews-stats__average-star']} />
            )
        );
    };

    return (
        <div className={style['reviews-stats']}>
            <div className={style['reviews-stats__average-card']}>
                <div className={style['reviews-stats__average-score']}>
                    {Math.round(rating * 10) / 10}
                </div>
                <div className={style['reviews-stats__average-stars']}>
                    {renderStars(rating)}
                </div>
                <div className={style['reviews-stats__average-text']}>
                    Based on {totalReviews} global ratings
                </div>
            </div>

            <div className={style['reviews-stats__distribution']}>
                {distribution.map((dist) => (
                    <div
                        key={dist.stars}
                        className={style['reviews-stats__dist-row']}
                        onClick={handleRowClick}
                    >
                        <span className={style['reviews-stats__dist-label']}>
                            {dist.stars}★
                        </span>
                        <div className={style['reviews-stats__dist-bar-wrap']}>
                            <div
                                className={style['reviews-stats__dist-bar-fill']}
                                style={{ width: `${dist.percentage}%` }}
                            />
                        </div>
                        <span className={style['reviews-stats__dist-value']}>
                            {dist.percentage}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ReviewsStats;
