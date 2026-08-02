import { AdminReview } from '@/entities/admin';

import { AdminReviewRow } from '../AdminReviewRow/AdminReviewRow';
import { AdminReviewRowSkeleton } from '../AdminReviewRow/AdminReviewRowSkeleton';
import style from './admin-reviews-table.module.scss';

interface AdminReviewsTableProps {
    reviews: AdminReview[];
    isLoading: boolean;
    limit: number;
    onDelete: (review: AdminReview) => void;
}

export const AdminReviewsTable = ({ reviews, isLoading, limit, onDelete }: AdminReviewsTableProps) => (
    <div className={style['admin-reviews-table']} role="list">
        <div className={style['admin-reviews-table__header']} role="presentation" aria-hidden="true">
            <span>Product</span>
            <span>Rating</span>
            <span>Review</span>
            <span>Author</span>
            <span>Helpful</span>
            <span>Actions</span>
        </div>

        {isLoading ? (
            <AdminReviewRowSkeleton count={limit} />
        ) : (
            reviews.map((review) => (
                <AdminReviewRow key={review.id} review={review} onDelete={onDelete} />
            ))
        )}
    </div>
);
