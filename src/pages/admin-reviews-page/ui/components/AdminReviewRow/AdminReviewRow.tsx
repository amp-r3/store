import { memo } from 'react';
import { Link } from 'react-router';
import { LuTrash2 } from 'react-icons/lu';

import { AdminReview } from '@/entities/admin';
import { RatingStars } from '@/shared/ui';

import style from './admin-review-row.module.scss';

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

interface AdminReviewRowProps {
    review: AdminReview;
    onDelete: (review: AdminReview) => void;
}

export const AdminReviewRow = memo(({ review, onDelete }: AdminReviewRowProps) => {
    return (
        <article role="listitem" className={style['admin-review-row']}>
            <div className={style['admin-review-row__cell']}>
                <span className={style['admin-review-row__cell-label']}>Product</span>
                <Link to={`/product/${review.productId}`} className={style['admin-review-row__product-link']}>
                    {review.productTitle}
                </Link>
            </div>

            <div className={style['admin-review-row__cell']}>
                <span className={style['admin-review-row__cell-label']}>Rating</span>
                <RatingStars value={review.rating} label={`Rated ${review.rating} out of 5 stars`} size="sm" />
            </div>

            <div className={style['admin-review-row__cell']}>
                <span className={style['admin-review-row__cell-label']}>Review</span>
                {review.comment ? (
                    <p className={style['admin-review-row__comment']}>{review.comment}</p>
                ) : (
                    <p className={`${style['admin-review-row__comment']} ${style['admin-review-row__comment--empty']}`}>
                        No comment provided.
                    </p>
                )}
            </div>

            <div className={style['admin-review-row__cell']}>
                <span className={style['admin-review-row__cell-label']}>Author</span>
                <span className={style['admin-review-row__author']}>{review.reviewerName}</span>
                {review.isVerified && (
                    <span className={style['admin-review-row__verified-badge']}>Verified</span>
                )}
                <span className={style['admin-review-row__date']}>{formatDate(review.date)}</span>
            </div>

            <div className={style['admin-review-row__cell']}>
                <span className={style['admin-review-row__cell-label']}>Helpful</span>
                {review.helpfulCount}
            </div>

            <div className={`${style['admin-review-row__cell']} ${style['admin-review-row__actions']}`}>
                <span className={style['admin-review-row__cell-label']}>Actions</span>
                <button
                    type="button"
                    className={`${style['admin-review-row__action']} ${style['admin-review-row__action--danger']}`}
                    onClick={() => onDelete(review)}
                    aria-label={`Delete review for ${review.productTitle}`}
                >
                    <LuTrash2 />
                </button>
            </div>
        </article>
    );
});

AdminReviewRow.displayName = 'AdminReviewRow';
