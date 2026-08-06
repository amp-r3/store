import { LuPowerOff } from 'react-icons/lu';

import { Modal, Alert } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';

interface AdminMethodDisableModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    methodName: string;
    isLoading: boolean;
    error?: unknown;
    onConfirm: () => void;
}

export const AdminMethodDisableModal = ({
    isOpen,
    onOpenChange,
    methodName,
    isLoading,
    error,
    onConfirm,
}: AdminMethodDisableModalProps) => (
    <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={`Turn off "${methodName}"?`}
        description="It disappears from checkout immediately. Customers with checkout already open will lose this selection on their next step. The set of methods is fixed — it can't be recreated later, only turned back on here."
        icon={<LuPowerOff />}
        actionLabel="Turn off"
        actionVariant="danger"
        onAction={onConfirm}
        isLoading={isLoading}
    >
        {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}
    </Modal>
);
