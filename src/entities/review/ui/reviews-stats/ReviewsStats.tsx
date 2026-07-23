import { FaRegStar, FaStar } from 'react-icons/fa';
import style from './reviews-stats.module.scss';
import { FC } from 'react';
import { useHaptics } from "@/shared/lib/hooks";
import { ReviewRatingStats } from "@/entities/review";

interface ReviewStatsProps {
    stats: ReviewRatingStats;
    activeRating: number | null;
    onRatingChange: (rating: number | null) => void;
}

export const ReviewsStats: FC<ReviewStatsProps> = ({ stats, activeRating, onRatingChange }) => {
    const { light } = useHaptics();

    const totalReviews = stats.total;
    const distribution = stats.distribution;

    // Derived from the same distribution the histogram renders, rather than
    // a separately fetched product.rating, so an optimistic add/edit/delete
    // (which patches stats.distribution) can't leave this number stale.
    const averageRating = totalReviews > 0
        ? distribution.reduce((sum, dist) => sum + dist.stars * dist.count, 0) / totalReviews
        : 0;

    const handleRowClick = (stars: number) => {
        light();
        onRatingChange(activeRating === stars ? null : stars);
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? (
                <FaStar key={i} className={style['reviews-stats__average-star']} aria-hidden="true" />
            ) : (
                <FaRegStar key={i} className={style['reviews-stats__average-star']} aria-hidden="true" />
            )
        );
    };

    return (
        <div className={style['reviews-stats']}>
            <div className={style['reviews-stats__average-card']}>
                <div className={style['reviews-stats__average-score']}>
                    {Math.round(averageRating * 10) / 10}
                </div>
                <div
                    className={style['reviews-stats__average-stars']}
                    role="img"
                    aria-label={`${Math.round(averageRating * 10) / 10} out of 5 stars`}
                >
                    {renderStars(averageRating)}
                </div>
                <div className={style['reviews-stats__average-text']}>
                    Based on {totalReviews} global ratings
                </div>
            </div>

            <div className={style['reviews-stats__distribution']} role="group" aria-label="Filter reviews by rating">
                <div className={style['reviews-stats__dist-title']}>Filter by rating</div>
                {distribution.map((dist) => (
                    <button
                        key={dist.stars}
                        type="button"
                        className={`${style['reviews-stats__dist-row']} ${
                            activeRating === dist.stars ? style['reviews-stats__dist-row--active'] : ''
                        }`}
                        disabled={dist.count === 0}
                        aria-disabled={dist.count === 0}
                        aria-pressed={activeRating === dist.stars}
                        aria-label={`${dist.stars} star reviews, ${dist.count} of ${totalReviews}`}
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
                        <span className={style['reviews-stats__dist-count']}>
                            ({dist.count})
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};
export default ReviewsStats;
