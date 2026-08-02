import { LuShieldCheck, LuShieldOff } from 'react-icons/lu';

import { Modal, Alert } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';
import { AdminCustomer, useSetAdminUserRoleMutation } from '@/entities/admin';

interface AdminCustomerRoleModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    customer: AdminCustomer | null;
}

export const AdminCustomerRoleModal = ({ isOpen, onOpenChange, customer }: AdminCustomerRoleModalProps) => {
    const [setUserRole, { isLoading, error }] = useSetAdminUserRoleMutation();

    const isPromoting = customer?.role === 'user';
    const nextRole = isPromoting ? 'admin' : 'user';

    const handleConfirm = async () => {
        if (!customer) return;
        try {
            await setUserRole({ userId: customer.id, role: nextRole }).unwrap();
            onOpenChange(false);
        } catch {
            // surfaced below via `error`
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title={isPromoting ? `Make "${customer?.username ?? ''}" an admin?` : `Remove admin access from "${customer?.username ?? ''}"?`}
            description={
                isPromoting
                    ? 'Admins get full access to orders, products, customers and reviews across the store.'
                    : 'They will lose access to the admin panel immediately, but keep their regular account and order history.'
            }
            icon={isPromoting ? <LuShieldCheck /> : <LuShieldOff />}
            actionLabel={isPromoting ? 'Make admin' : 'Remove admin access'}
            actionVariant={isPromoting ? 'danger' : 'default'}
            onAction={handleConfirm}
            isLoading={isLoading}
        >
            {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}
        </Modal>
    );
};
