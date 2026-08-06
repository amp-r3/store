import { LuTriangleAlert } from 'react-icons/lu';

import { Modal, Alert } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';
import { AdminCategory, useDeleteAdminCategoryMutation } from '@/entities/admin';

interface AdminCategoryDeleteModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    category: AdminCategory | null;
}

export const AdminCategoryDeleteModal = ({ isOpen, onOpenChange, category }: AdminCategoryDeleteModalProps) => {
    const [deleteCategory, { isLoading, error }] = useDeleteAdminCategoryMutation();

    const handleDelete = async () => {
        if (!category) return;
        try {
            await deleteCategory(category.id).unwrap();
            onOpenChange(false);
        } catch {
            // surfaced below via `error`
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={`Delete "${category?.name ?? ''}"?`}
            description={
                category && category.productsCount > 0
                    ? `${category.productsCount} product${category.productsCount === 1 ? '' : 's'} will keep existing but lose this category — they won't be deleted.`
                    : 'This category has no products.'
            }
            icon={<LuTriangleAlert />}
            actionLabel="Delete"
            actionVariant="danger"
            onAction={handleDelete}
            isLoading={isLoading}
        >
            {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}
        </Modal>
    );
};
