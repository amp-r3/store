import { ReviewsSort } from '@/features/product-reviews-sort/ui/ReviewsSort/ReviewsSort';
import style from './reviews-controls.module.scss';
import { useHaptics } from "@/shared/lib/hooks";

export const ReviewsControls = () => {
    const { light } = useHaptics();

    const mockFilters = [
        { label: 'All', count: 128, active: true },
        { label: '5 ★', count: 96, active: false },
        { label: '4 ★', count: 21, active: false },
        { label: '3 ★', count: 8, active: false },
    ];

    const handleFilterClick = () => {
        light(); // Tactile vibration on filter action
    };

    return (
        <div className={style['reviews-controls']}>
            <div className={style['reviews-controls__filters']}>
                {mockFilters.map((filter, idx) => (
                    <button
                        key={idx}
                        type="button"
                        className={`${style['reviews-controls__filter-pill']} ${
                            filter.active ? style['reviews-controls__filter-pill--active'] : ''
                        }`}
                        onClick={handleFilterClick}
                    >
                        <span className={style['reviews-controls__filter-pill-label']}>
                            {filter.label}
                        </span>
                        <span className={style['reviews-controls__filter-pill-count']}>
                            ({filter.count})
                        </span>
                    </button>
                ))}
            </div>

            <ReviewsSort />
        </div>
    );
};
export default ReviewsControls;
