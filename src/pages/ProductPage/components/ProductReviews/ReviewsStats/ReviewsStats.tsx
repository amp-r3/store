import { FaStar } from 'react-icons/fa';
import { useHaptics } from '@/hooks';
import style from './reviews-stats.module.scss';

export const ReviewsStats = () => {
    const { light } = useHaptics();

    const totalReviews = 128;
    const averageRating = 4.8;
    const distribution = [
        { stars: 5, percentage: 74, count: 96 },
        { stars: 4, percentage: 16, count: 21 },
        { stars: 3, percentage: 6, count: 8 },
        { stars: 2, percentage: 3, count: 4 },
        { stars: 1, percentage: 1, count: 1 },
    ];

    const handleRowClick = () => {
        light();
    };

    return (
        <div className={style['reviews-stats']}>
            <div className={style['reviews-stats__average-card']}>
                <div className={style['reviews-stats__average-score']}>
                    {averageRating}
                </div>
                <div className={style['reviews-stats__average-stars']}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar key={i} className={style['reviews-stats__average-star']} />
                    ))}
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
