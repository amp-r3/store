import { memo, useState } from 'react';
import { Link } from 'react-router';
import { FaStar, FaRegStar, FaCalendarDay, FaThumbsUp, FaPen, FaTrash } from 'react-icons/fa';

import { Modal } from '@/shared/ui';
import { useHaptics } from '@/shared/lib/hooks';
import { getErrorMessage } from '@/shared/lib';
import { useDeleteReviewMutation } from '@/entities/review';
import { ProductReview, ReviewProductPreview } from '@/entities/review';

import style from './user-review-card.module.scss';

interface UserReviewCardProps {
    review: ProductReview;
    product?: ReviewProductPreview;
    onEdit: () => void;
}

export const UserReviewCard = memo(({ review, product, onEdit }: UserReviewCardProps) => {
    const { soft, success } = useHaptics();
    const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleDelete = async () => {
        setDeleteError(null);
        try {
            await deleteReview({ reviewId: review.id, productId: review.productId }).unwrap();
            success();
            setIsConfirmOpen(false);
        } catch (err) {
            setDeleteError(getErrorMessage(err));
        }
    };

    const handleEdit = () => {
        soft();
        onEdit();
    };

    const title = product?.title ?? `Product #${review.productId}`;

    return (
        <article className={style['user-review-card']}>
            <Link
                to={`/product/${review.productId}`}
                className={style['user-review-card__product']}
                onClick={soft}
            >
                {product?.thumbnail ? (
                    <img
                        src={product.thumbnail}
                        alt=""
                        className={style['user-review-card__thumb']}
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className={style['user-review-card__thumb--fallback']} aria-hidden="true" />
                )}
                <span className={style['user-review-card__title']}>{title}</span>
            </Link>

            <div className={style['user-review-card__body']}>
                <div className={style['user-review-card__summary']}>
                    <div
                        className={style['user-review-card__rating']}
                        aria-label={`You rated this ${review.rating} out of 5 stars`}
                    >
                        {Array.from({ length: 5 }, (_, i) =>
                            i < review.rating ? (
                                <FaStar key={i} className={style['user-review-card__star--filled']} />
                            ) : (
                                <FaRegStar key={i} className={style['user-review-card__star--empty']} />
                            )
                        )}
                    </div>

                    <div className={style['user-review-card__meta']}>
                        <FaCalendarDay className={style['user-review-card__meta-icon']} />
                        <time dateTime={review.date}>
                            {new Date(review.date).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                            })}
                        </time>
                        {review.isEdited && (
                            <span className={style['user-review-card__edited']}>(edited)</span>
                        )}
                        {review.helpfulCount > 0 && (
                            <span className={style['user-review-card__helpful']}>
                                <FaThumbsUp className={style['user-review-card__meta-icon']} />
                                {review.helpfulCount}
                            </span>
                        )}
                    </div>
                </div>

                {review.comment ? (
                    <p className={style['user-review-card__comment']}>{review.comment}</p>
                ) : (
                    <p className={style['user-review-card__comment--empty']}>
                        You rated this without leaving a comment.
                    </p>
                )}
            </div>

            <footer className={style['user-review-card__footer']}>
                <button
                    type="button"
                    className={style['user-review-card__action']}
                    onClick={handleEdit}
                >
                    <FaPen className={style['user-review-card__action-icon']} />
                    Edit
                </button>
                <button
                    type="button"
                    className={`${style['user-review-card__action']} ${style['user-review-card__action--danger']}`}
                    onClick={() => setIsConfirmOpen(true)}
                >
                    <FaTrash className={style['user-review-card__action-icon']} />
                    Delete
                </button>
                {deleteError && (
                    <span className={style['user-review-card__error']} role="alert">
                        {deleteError}
                    </span>
                )}
            </footer>

            <Modal
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Delete this review?"
                description={`Your review for "${title}" will be removed permanently. You can always write a new one later.`}
                icon={<FaTrash />}
                actionLabel="Delete"
                actionVariant="danger"
                onAction={handleDelete}
                isLoading={isDeleting}
            />
        </article>
    );
});

UserReviewCard.displayName = 'UserReviewCard';
