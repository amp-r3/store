import style from './reviews-controls.module.scss';
import { FaTimes } from 'react-icons/fa';
import { useHaptics } from "@/shared/lib/hooks";

interface ReviewsControlsProps {
    shownCount: number;
    totalCount: number;
    activeRating: number | null;
    onRatingChange: (rating: number | null) => void;
    sortSlot?: React.ReactNode;
}

export const ReviewsControls = ({ shownCount, totalCount, activeRating, onRatingChange, sortSlot }: ReviewsControlsProps) => {
    const { light } = useHaptics();

    const handleClearFilter = () => {
        light(); // Tactile vibration on filter action
        onRatingChange(null);
    };

    return (
        <div className={style['reviews-controls']}>
            <div className={style['reviews-controls__summary']}>
                <span className={style['reviews-controls__count']} aria-live="polite">
                    Showing {shownCount} of {totalCount} reviews
                </span>
                {activeRating !== null && (
                    <button
                        type="button"
                        className={style['reviews-controls__chip']}
                        onClick={handleClearFilter}
                        aria-label={`Clear ${activeRating} star filter`}
                    >
                        <span>{activeRating} ★</span>
                        <FaTimes aria-hidden="true" />
                    </button>
                )}
            </div>

            {totalCount > 0 && (
                <div className={style['reviews-controls__sort']}>
                    {sortSlot}
                </div>
            )}
        </div>
    );
};
export default ReviewsControls;
