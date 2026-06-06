import { FaStar, FaRegStar, FaCalendarDay, FaUserCheck, FaThumbsUp } from 'react-icons/fa';
import { useHaptics } from '@/hooks';
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

const getAvatarStyle = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    const s = 65;
    const l = 45;
    return {
        background: `linear-gradient(135deg, hsl(${h}, ${s}%, ${l}%), hsl(${(h + 40) % 360}, ${s}%, ${l - 10}%))`,
    };
};

const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
};

export const ReviewCard = ({ review }: ReviewCardProps) => {
    const { soft } = useHaptics();

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? (
                <FaStar key={i} className={style['review-card__star--filled']} />
            ) : (
                <FaRegStar key={i} className={style['review-card__star--empty']} />
            )
        );
    };

    const helpfulCount = (review.reviewerName.length * 7 + review.comment.length) % 11;

    const handleHelpfulClick = () => {
        soft();
    };

    return (
        <article className={style['review-card']}>
            <div className={style['review-card__header']}>
                <div className={style['review-card__user']}>
                    <div
                        className={style['review-card__avatar']}
                        style={getAvatarStyle(review.reviewerName)}
                    >
                        {getInitials(review.reviewerName)}
                    </div>
                    <div className={style['review-card__author-info']}>
                        <span className={style['review-card__author-name']}>
                            {review.reviewerName}
                        </span>
                        <span className={style['review-card__badge']}>
                            <FaUserCheck className={style['review-card__badge-icon']} />
                            Verified Purchase
                        </span>
                    </div>
                </div>

                <div
                    className={style['review-card__rating']}
                    aria-label={`Rated ${review.rating} out of 5 stars`}
                >
                    {renderStars(review.rating)}
                </div>
            </div>

            <div className={style['review-card__meta']}>
                <FaCalendarDay className={style['review-card__meta-icon']} />
                <time className={style['review-card__date']}>
                    {new Date(review.date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}
                </time>
            </div>

            <p className={style['review-card__comment']}>{review.comment}</p>

            <div className={style['review-card__footer']}>
                <button
                    type="button"
                    className={style['review-card__helpful-btn']}
                    onClick={handleHelpfulClick}
                >
                    <FaThumbsUp className={style['review-card__helpful-icon']} />
                    <span>Helpful</span>
                    <span className={style['review-card__helpful-count']}>
                        ({helpfulCount})
                    </span>
                </button>
            </div>
        </article>
    );
};