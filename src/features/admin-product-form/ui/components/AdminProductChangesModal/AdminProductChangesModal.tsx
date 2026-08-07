import { LuListChecks } from 'react-icons/lu';

import { Modal, Alert } from '@/shared/ui';
import { AuditDiff } from '@/entities/admin';

import { ProductChanges } from '../../../model/buildProductChanges';

import style from './admin-product-changes-modal.module.scss';

interface AdminProductChangesModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    productTitle: string;
    changes: ProductChanges | null;
    error?: string | null;
    isLoading: boolean;
    onConfirm: () => void;
}

export const AdminProductChangesModal = ({
    isOpen,
    onOpenChange,
    productTitle,
    changes,
    error,
    isLoading,
    onConfirm,
}: AdminProductChangesModalProps) => (
    <Modal
        isOpen={isOpen}
        onOpenChange={(open) => { if (!isLoading) onOpenChange(open); }}
        title="Confirm changes"
        description={`Review the changes to "${productTitle}" before saving.`}
        icon={<LuListChecks />}
        actionLabel="Confirm"
        onAction={onConfirm}
        isLoading={isLoading}
    >
        {!!error && <Alert variant="error">{error}</Alert>}
        {changes && (
            <div className={style.diffScroll}>
                <AuditDiff before={changes.before} after={changes.after} />
            </div>
        )}
    </Modal>
);
