import { ReviewMenu } from "./components";
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { FaStar, FaRegStar, FaCalendarDay, FaUserCheck, FaThumbsUp } from 'react-icons/fa';
import { useDeleteReviewMutation, useToggleReviewLikeMutation } from '@/entities/review';
import style from './review-card.module.scss';
import { useHaptics } from "@/shared/lib/hooks";
import { ExpandableContent } from '@/shared/ui';
import { ProductReview } from "@/entities/review";
import { useAppSelector } from "@/shared/model";
import { selectUser } from "@/entities/session";
import { getErrorMessage } from "@/shared/lib";

interface ReviewCardProps {
    review: ProductReview;
    isCurrentUser?: boolean;
    onEdit?: () => void;
}

const getAvatarStyle = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    const s = 65;
    // Kept dark enough that white initials stay legible across the full hue range.
    const l = 35;
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

export const ReviewCard = ({ review, isCurrentUser, onEdit }: ReviewCardProps) => {
    const { soft } = useHaptics();
    const user = useAppSelector(selectUser);
    const [deleteReview] = useDeleteReviewMutation();
    const [toggleLike] = useToggleReviewLikeMutation();
    const [likeError, setLikeError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // The "sign in to like" message must not linger after the user actually
    // signs in — it was only ever cleared on a successful like before.
    useEffect(() => {
        setLikeError(null);
    }, [user?.id]);

    const handleDelete = async () => {
        try {
            await deleteReview({ reviewId: review.id, productId: review.productId }).unwrap();
            soft();
        } catch (error) {
            setDeleteError(getErrorMessage(error));
        }
    };

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? (
                <FaStar key={i} className={style['review-card__star--filled']} aria-hidden="true" />
            ) : (
                <FaRegStar key={i} className={style['review-card__star--empty']} aria-hidden="true" />
            )
        );
    };

    const handleHelpfulClick = async () => {
        if (!user) {
            setLikeError('Sign in to mark reviews as helpful.');
            return;
        }

        soft();
        setLikeError(null);
        try {
            await toggleLike({ reviewId: review.id, productId: review.productId }).unwrap();
        } catch (error) {
            const message = getErrorMessage(error);
            // The API mutex rejects an overlapping click for a request that's
            // already in flight — the first click is already handling it, so
            // this isn't a real failure worth surfacing to the user.
            if (message === 'Request already in progress') return;
            setLikeError(message);
        }
    };

    return (
        <article className={`${style['review-card']} ${isCurrentUser ? style['review-card--current-user'] : ''}`}>
            {isCurrentUser && onEdit && (
                <div className={style['review-card__menu']}>
                    <ReviewMenu onEdit={onEdit} onDelete={handleDelete} />
                </div>
            )}

            <div className={`${style['review-card__header']} ${isCurrentUser ? style['review-card__header--with-menu'] : ''}`}>
                <div className={style['review-card__user']}>
                    <div
                        className={style['review-card__avatar']}
                        style={getAvatarStyle(review.reviewerName || 'Anonymous')}
                        aria-hidden="true"
                    >
                        {getInitials(review.reviewerName || 'Anonymous')}
                    </div>
                    <div className={style['review-card__author-info']}>
                        <span className={style['review-card__author-name']}>
                            {review.reviewerName || 'Anonymous'}
                        </span>
                        {isCurrentUser ? (
                            <span className={`${style['review-card__badge']} ${style['review-card__badge--own']}`}>
                                <FaUserCheck className={style['review-card__badge-icon']} aria-hidden="true" />
                                Your Review
                            </span>
                        ) : review.isVerified ? (
                            <span className={style['review-card__badge']}>
                                <FaUserCheck className={style['review-card__badge-icon']} aria-hidden="true" />
                                Verified Purchase
                            </span>
                        ) : null}
                    </div>
                </div>

                <div className={style['review-card__actions']}>
                    <div
                        className={style['review-card__rating']}
                        role="img"
                        aria-label={`Rated ${review.rating} out of 5 stars`}
                    >
                        {renderStars(review.rating)}
                    </div>
                </div>
            </div>

            <div className={style['review-card__meta']}>
                <FaCalendarDay className={style['review-card__meta-icon']} aria-hidden="true" />
                <time className={style['review-card__date']} dateTime={review.date}>
                    {new Date(review.date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}
                </time>
                {review.isEdited && <span className={style['review-card__edited']}>(edited)</span>}
            </div>

            {review.comment ? (
                <ExpandableContent maxHeight={120}>
                    <p className={style['review-card__comment']}>{review.comment}</p>
                </ExpandableContent>
            ) : (
                <p className={`${style['review-card__comment']} ${style['review-card__comment--empty']}`}>
                    No comment provided.
                </p>
            )}

            <div className={style['review-card__footer']}>
                <div className={style['review-card__helpful-wrapper']}>
                    <button
                        type="button"
                        className={`${style['review-card__helpful-btn']} ${review.isLiked ? style['review-card__helpful-btn--liked'] : ''}`}
                        onClick={handleHelpfulClick}
                        aria-pressed={review.isLiked}
                    >
                        <FaThumbsUp className={style['review-card__helpful-icon']} aria-hidden="true" />
                        <span>Helpful</span>
                        <span className={style['review-card__helpful-count']}>
                            ({review.helpfulCount})
                        </span>
                    </button>
                    {likeError && (
                        <span className={style['review-card__error-msg']} role="alert">
                            {likeError}
                            {!user && (
                                <>
                                    {' '}
                                    <Link to="/login" className={style['review-card__error-link']}>Sign in</Link>
                                </>
                            )}
                        </span>
                    )}
                    {deleteError && (
                        <span className={style['review-card__error-msg']} role="alert">
                            {deleteError}
                        </span>
                    )}
                </div>
            </div>
        </article>
    );
};