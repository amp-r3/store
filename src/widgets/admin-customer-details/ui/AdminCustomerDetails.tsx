import { FC } from 'react';

import { AdminCustomer } from '@/entities/admin';
import { useMediaQuery } from '@/shared/lib/hooks';

import { AdminCustomerDetailsDrawer } from './AdminCustomerDetailsDrawer/AdminCustomerDetailsDrawer';

export interface AdminCustomerDetailsProps {
    open: boolean;
    customer: AdminCustomer;
    isFetching: boolean;
    onOpenChange(): void;
}

export const AdminCustomerDetails: FC<AdminCustomerDetailsProps> = (props) => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const direction = isMobile ? 'bottom' : 'right';

    return <AdminCustomerDetailsDrawer key={direction} direction={direction} {...props} />;
};
