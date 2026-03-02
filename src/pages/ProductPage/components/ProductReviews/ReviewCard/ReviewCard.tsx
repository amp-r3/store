import { FaStar, FaRegStar, FaCalendarDay } from 'react-icons/fa';
import style from './review-card.module.scss';

export interface Review {
    reviewerName: string;
    rating: number;
    date: string | Date;
    comment: string;
}

interface ReviewCardProps {
    review: Review;
}

export const ReviewCard = ({ review }: ReviewCardProps) => {
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? <FaStar key={i} /> : <FaRegStar key={i} />
        );
    };

    return (
        <div className={style['review-card']}>
            <div className={style['review-header']}>
                <span className={style['review-author']}>{review.reviewerName}</span>
                <div className={style['review-rating']}>
                    {renderStars(review.rating)}
                </div>
            </div>
            <div className={style['review-meta']}>
                <FaCalendarDay />
                <span>{new Date(review.date).toLocaleDateString()}</span>
            </div>
            <p className={style['review-comment']}>{review.comment}</p>
        </div>
    );
};