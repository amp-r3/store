import { FC } from 'react';
import Image from 'next/image';
import { LuShieldCheck } from 'react-icons/lu';

import { AdminCustomer } from '@/entities/admin';

import style from './admin-customer-details-header.module.scss';

interface AdminCustomerDetailsHeaderProps {
    customer: AdminCustomer;
    isFetching: boolean;
}

const getDisplayName = (customer: AdminCustomer) => {
    const fullName = `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim();
    return fullName || `@${customer.username}`;
};

const getInitial = (customer: AdminCustomer) => {
    const name = customer.firstName || customer.lastName;
    if (name) return name.charAt(0).toUpperCase();
    return customer.username.charAt(0).toUpperCase();
};

export const AdminCustomerDetailsHeader: FC<AdminCustomerDetailsHeaderProps> = ({ customer, isFetching }) => (
    <header className={style['header']} aria-label="Customer details header">
        <div className={style['header__identity']}>
            {customer.avatarUrl ? (
                <Image src={customer.avatarUrl} alt="" width={56} height={56} className={style['header__avatar']} />
            ) : (
                <span className={style['header__avatar-fallback']} aria-hidden="true">
                    {getInitial(customer)}
                </span>
            )}

            <div className={style['header__info']}>
                <h2 className={style['header__name']}>{getDisplayName(customer)}</h2>
                <span className={style['header__username']}>@{customer.username}</span>
                <span className={style['header__email']}>{customer.email}</span>
            </div>
        </div>

        <div className={style['header__badges']}>
            {isFetching && (
                <span className={style['header__badge-update']} aria-live="polite" role="status">
                    <span className="sr-only">Customer data is </span>
                    Updating...
                </span>
            )}
            <span className={`${style['header__role-badge']} ${customer.role === 'admin' ? style['header__role-badge--admin'] : ''}`}>
                {customer.role === 'admin' && <LuShieldCheck aria-hidden="true" />}
                {customer.role === 'admin' ? 'Admin' : 'Customer'}
            </span>
        </div>
    </header>
);
