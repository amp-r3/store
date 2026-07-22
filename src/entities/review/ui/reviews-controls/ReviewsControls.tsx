import style from './reviews-controls.module.scss';
import { useHaptics } from "@/shared/lib/hooks";
import { ReviewRatingStats } from "@/entities/review";

interface ReviewsControlsProps {
    stats: ReviewRatingStats;
    activeRating: number | null;
    onRatingChange: (rating: number | null) => void;
    sortSlot?: React.ReactNode;
}

export const ReviewsControls = ({ stats, activeRating, onRatingChange, sortSlot }: ReviewsControlsProps) => {
    const { light } = useHaptics();

    const handleFilterClick = (rating: number | null) => {
        light(); // Tactile vibration on filter action
        onRatingChange(rating);
    };

    return (
        <div className={style['reviews-controls']}>
            <div className={style['reviews-controls__filters']}>
                <button
                    type="button"
                    className={`${style['reviews-controls__filter-pill']} ${
                        activeRating === null ? style['reviews-controls__filter-pill--active'] : ''
                    }`}
                    onClick={() => handleFilterClick(null)}
                >
                    <span className={style['reviews-controls__filter-pill-label']}>All</span>
                    <span className={style['reviews-controls__filter-pill-count']}>
                        ({stats.total})
                    </span>
                </button>
                {stats.distribution.map((item) => (
                    <button
                        key={item.stars}
                        type="button"
                        className={`${style['reviews-controls__filter-pill']} ${
                            activeRating === item.stars ? style['reviews-controls__filter-pill--active'] : ''
                        }`}
                        onClick={() => handleFilterClick(item.stars)}
                    >
                        <span className={style['reviews-controls__filter-pill-label']}>
                            {item.stars} ★
                        </span>
                        <span className={style['reviews-controls__filter-pill-count']}>
                            ({item.count})
                        </span>
                    </button>
                ))}
            </div>

            {sortSlot}
        </div>
    );
};
export default ReviewsControls;
