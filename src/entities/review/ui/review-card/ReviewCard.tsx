import { ReviewMenu } from "./components";
import { useState } from 'react';
import { FaStar, FaRegStar, FaCalendarDay, FaUserCheck, FaThumbsUp } from 'react-icons/fa';
import { useDeleteReviewMutation, useToggleReviewLikeMutation } from '@/entities/review';
import style from './review-card.module.scss';
import { useHaptics } from "@/shared/lib/hooks";
import { ProductReview } from "@/entities/review";
import { useAppDispatch } from "@/shared/model";
import { useAppSelector } from "@/shared/model";
import { openReviewModal } from "@/features/order-review";

interface ReviewCardProps {
    review: ProductReview;
    isCurrentUser?: boolean;
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

export const ReviewCard = ({ review, isCurrentUser }: ReviewCardProps) => {
    const { soft } = useHaptics();
    const dispatch = useAppDispatch();
    const user = useAppSelector(state => state.auth.user);
    const [deleteReview] = useDeleteReviewMutation();
    const [toggleLike, { isLoading: isToggleLikeLoading }] = useToggleReviewLikeMutation();
    const [likeError, setLikeError] = useState<string | null>(null);

    const handleEdit = () => {
        dispatch(openReviewModal(review.productId.toString()));
    };

    const handleDelete = async () => {
        try {
            await deleteReview({ reviewId: review.id, productId: review.productId }).unwrap();
            soft();
        } catch (error) {
            console.error('Failed to delete review:', error);
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? (
                <FaStar key={i} className={style['review-card__star--filled']} />
            ) : (
                <FaRegStar key={i} className={style['review-card__star--empty']} />
            )
        );
    };

    const handleHelpfulClick = async () => {
        if (!user) {
            setLikeError('Only registered users can like');
            return;
        }

        if (isToggleLikeLoading) return;

        soft();
        setLikeError(null);
        try {
            await toggleLike({ reviewId: review.id, productId: review.productId }).unwrap();
        } catch (error) {
            console.error('Failed to toggle helpful:', error);
        }
    };

    return (
        <article className={`${style['review-card']} ${isCurrentUser ? style['review-card--current-user'] : ''}`}>
            {isCurrentUser && (
                <div className={style['review-card__menu']}>
                    <ReviewMenu onEdit={handleEdit} onDelete={handleDelete} />
                </div>
            )}

            <div className={`${style['review-card__header']} ${isCurrentUser ? style['review-card__header--with-menu'] : ''}`}>
                <div className={style['review-card__user']}>
                    <div
                        className={style['review-card__avatar']}
                        style={getAvatarStyle(review.reviewerName || 'Anonymous')}
                    >
                        {getInitials(review.reviewerName || 'Anonymous')}
                    </div>
                    <div className={style['review-card__author-info']}>
                        <span className={style['review-card__author-name']}>
                            {review.reviewerName || 'Anonymous'}
                        </span>
                        {isCurrentUser ? (
                            <span className={`${style['review-card__badge']} ${style['review-card__badge--own']}`}>
                                <FaUserCheck className={style['review-card__badge-icon']} />
                                Your Review
                            </span>
                        ) : (
                            <span className={style['review-card__badge']}>
                                <FaUserCheck className={style['review-card__badge-icon']} />
                                Verified Purchase
                            </span>
                        )}
                    </div>
                </div>

                <div className={style['review-card__actions']}>
                    <div
                        className={style['review-card__rating']}
                        aria-label={`Rated ${review.rating} out of 5 stars`}
                    >
                        {renderStars(review.rating)}
                    </div>
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
                {review.isEdited && <span className={style['review-card__edited']}>(edited)</span>}
            </div>

            <p className={style['review-card__comment']}>{review.comment}</p>

            <div className={style['review-card__footer']}>
                <div className={style['review-card__helpful-wrapper']}>
                    <button
                        type="button"
                        className={`${style['review-card__helpful-btn']} ${review.isLiked ? style['review-card__helpful-btn--liked'] : ''}`}
                        onClick={handleHelpfulClick}
                    >
                        <FaThumbsUp className={style['review-card__helpful-icon']} />
                        <span>Helpful</span>
                        <span className={style['review-card__helpful-count']}>
                            ({review.helpfulCount})
                        </span>
                    </button>
                    {likeError && (
                        <span className={style['review-card__error-msg']}>
                            {likeError}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
};