import { LuTrash2 } from 'react-icons/lu';

import { Modal, Alert } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';
import { AdminReview, useDeleteAdminReviewMutation } from '@/entities/admin';

interface AdminReviewDeleteModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    review: AdminReview | null;
}

export const AdminReviewDeleteModal = ({ isOpen, onOpenChange, review }: AdminReviewDeleteModalProps) => {
    const [deleteReview, { isLoading, error }] = useDeleteAdminReviewMutation();

    const handleDelete = async () => {
        if (!review) return;
        try {
            await deleteReview({ reviewId: review.id, productId: review.productId }).unwrap();
            onOpenChange(false);
        } catch {
            // surfaced below via `error`
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={`Delete this review for "${review?.productTitle ?? ''}"?`}
            description="This can't be undone: the product's rating and review count will recalculate immediately, and any helpful votes on it are removed along with it."
            icon={<LuTrash2 />}
            actionLabel="Delete"
            actionVariant="danger"
            onAction={handleDelete}
            isLoading={isLoading}
        >
            {review?.comment && <p>&ldquo;{review.comment}&rdquo;</p>}
            {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}
        </Modal>
    );
};
