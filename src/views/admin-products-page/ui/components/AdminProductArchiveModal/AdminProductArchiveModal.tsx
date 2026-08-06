import { LuArchive } from 'react-icons/lu';

import { Modal, Alert } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';
import { AdminProductListItem, useArchiveAdminProductMutation } from '@/entities/admin';

interface AdminProductArchiveModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    product: AdminProductListItem | null;
}

export const AdminProductArchiveModal = ({ isOpen, onOpenChange, product }: AdminProductArchiveModalProps) => {
    const [archiveProduct, { isLoading, error }] = useArchiveAdminProductMutation();

    const handleArchive = async () => {
        if (!product) return;
        try {
            await archiveProduct({ id: product.id, archived: true }).unwrap();
            onOpenChange(false);
        } catch {
            // surfaced below via `error`
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={`Archive "${product?.title ?? ''}"?`}
            description="Archived products disappear from the catalog and search, but stay editable here. Deleting a product outright isn't possible once it's been ordered, so archiving is the only way to retire it."
            icon={<LuArchive />}
            actionLabel="Archive"
            actionVariant="danger"
            onAction={handleArchive}
            isLoading={isLoading}
        >
            {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}
        </Modal>
    );
};
