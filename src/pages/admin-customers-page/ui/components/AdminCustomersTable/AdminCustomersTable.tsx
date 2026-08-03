import { AdminCustomer } from '@/entities/admin';

import { AdminCustomerRow } from '../AdminCustomerRow/AdminCustomerRow';
import { AdminCustomerRowSkeleton } from '../AdminCustomerRow/AdminCustomerRowSkeleton';
import style from './admin-customers-table.module.scss';

interface AdminCustomersTableProps {
    customers: AdminCustomer[];
    isLoading: boolean;
    limit: number;
    currentUserId: string | null;
    onOpenDetails: (customerId: string) => void;
    onChangeRole: (customer: AdminCustomer) => void;
}

export const AdminCustomersTable = ({ customers, isLoading, limit, currentUserId, onOpenDetails, onChangeRole }: AdminCustomersTableProps) => (
    <div className={style['admin-customers-table']} role="list">
        <div className={style['admin-customers-table__header']} role="presentation" aria-hidden="true">
            <span>Customer</span>
            <span>Email</span>
            <span>Role</span>
            <span>Orders</span>
            <span>Spent</span>
            <span>Registered</span>
            <span />
        </div>

        {isLoading ? (
            <AdminCustomerRowSkeleton count={limit} />
        ) : (
            customers.map((customer) => (
                <AdminCustomerRow
                    key={customer.id}
                    customer={customer}
                    isCurrentUser={customer.id === currentUserId}
                    onOpenDetails={onOpenDetails}
                    onChangeRole={onChangeRole}
                />
            ))
        )}
    </div>
);
