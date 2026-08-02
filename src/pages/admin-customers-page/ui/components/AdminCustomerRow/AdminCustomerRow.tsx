import { memo } from 'react';
import { LuShieldCheck } from 'react-icons/lu';

import { AdminCustomer } from '@/entities/admin';
import { formatPrice } from '@/shared/lib';

import style from './admin-customer-row.module.scss';

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const getDisplayName = (customer: AdminCustomer) => {
    const fullName = `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim();
    return fullName || `@${customer.username}`;
};

const getInitial = (customer: AdminCustomer) => {
    const name = customer.firstName || customer.lastName;
    if (name) return name.charAt(0).toUpperCase();
    return customer.username.charAt(0).toUpperCase();
};

interface AdminCustomerRowProps {
    customer: AdminCustomer;
    isCurrentUser: boolean;
    onOpenDetails: (customerId: string) => void;
    onChangeRole: (customer: AdminCustomer) => void;
}

export const AdminCustomerRow = memo(({ customer, isCurrentUser, onOpenDetails, onChangeRole }: AdminCustomerRowProps) => {
    return (
        <article role="listitem" className={style['admin-customer-row']}>
            <div className={style['admin-customer-row__cell']}>
                <span className={style['admin-customer-row__cell-label']}>Customer</span>
                <button
                    type="button"
                    className={style['admin-customer-row__identity']}
                    onClick={() => onOpenDetails(customer.id)}
                >
                    {customer.avatarUrl ? (
                        <img src={customer.avatarUrl} alt="" className={style['admin-customer-row__avatar']} />
                    ) : (
                        <span className={style['admin-customer-row__avatar-fallback']} aria-hidden="true">
                            {getInitial(customer)}
                        </span>
                    )}
                    <span className={style['admin-customer-row__name']}>{getDisplayName(customer)}</span>
                </button>
            </div>

            <div className={style['admin-customer-row__cell']}>
                <span className={style['admin-customer-row__cell-label']}>Email</span>
                <span className={style['admin-customer-row__email']}>{customer.email}</span>
            </div>

            <div className={style['admin-customer-row__cell']}>
                <span className={style['admin-customer-row__cell-label']}>Role</span>
                <span className={`${style['admin-customer-row__role-badge']} ${customer.role === 'admin' ? style['admin-customer-row__role-badge--admin'] : ''}`}>
                    {customer.role === 'admin' && <LuShieldCheck aria-hidden="true" />}
                    {customer.role === 'admin' ? 'Admin' : 'Customer'}
                </span>
            </div>

            <div className={style['admin-customer-row__cell']}>
                <span className={style['admin-customer-row__cell-label']}>Orders</span>
                {customer.ordersCount}
            </div>

            <div className={style['admin-customer-row__cell']}>
                <span className={style['admin-customer-row__cell-label']}>Spent</span>
                <span className={style['admin-customer-row__spent']}>{formatPrice(customer.totalSpent)}</span>
            </div>

            <div className={style['admin-customer-row__cell']}>
                <span className={style['admin-customer-row__cell-label']}>Registered</span>
                <span>{formatDate(customer.registeredAt)}</span>
                <button
                    type="button"
                    className={style['admin-customer-row__role-action']}
                    onClick={() => onChangeRole(customer)}
                    disabled={isCurrentUser}
                    title={isCurrentUser ? "You can't change your own role" : undefined}
                    aria-label={isCurrentUser ? "You can't change your own role" : `Change role for ${getDisplayName(customer)}`}
                >
                    Change role
                </button>
            </div>
        </article>
    );
});

AdminCustomerRow.displayName = 'AdminCustomerRow';
