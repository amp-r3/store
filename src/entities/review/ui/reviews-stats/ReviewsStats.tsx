import { FaRegStar, FaStar } from 'react-icons/fa';
import style from './reviews-stats.module.scss';
import { FC } from 'react';
import { useHaptics } from "@/shared/lib/hooks";
import { ReviewRatingStats } from "@/entities/review";

interface ReviewStatsProps {
    stats: ReviewRatingStats;
    rating: number;
    activeRating: number | null;
    onRatingChange: (rating: number | null) => void;
}

export const ReviewsStats: FC<ReviewStatsProps> = ({ stats, rating, activeRating, onRatingChange }) => {
    const { light } = useHaptics();

    const totalReviews = stats.total;
    const distribution = stats.distribution;

    const handleRowClick = (stars: number) => {
        light();
        onRatingChange(activeRating === stars ? null : stars);
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
                    <button
                        key={dist.stars}
                        type="button"
                        className={`${style['reviews-stats__dist-row']} ${
                            activeRating === dist.stars ? style['reviews-stats__dist-row--active'] : ''
                        }`}
                        aria-pressed={activeRating === dist.stars}
                        onClick={() => handleRowClick(dist.stars)}
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
                    </button>
                ))}
            </div>
        </div>
    );
};
export default ReviewsStats;
