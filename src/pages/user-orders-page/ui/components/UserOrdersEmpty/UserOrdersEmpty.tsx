import { Link } from 'react-router';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { LuPackage } from 'react-icons/lu';

import { OrdersScope } from '@/entities/order';

import style from './user-orders-empty.module.scss';

interface UserOrdersEmptyProps {
    variant: OrdersScope;
    /** Steers the CTA toward the other tab when it actually has orders. */
    hasOtherTabOrders: boolean;
}

export const UserOrdersEmpty = ({ variant, hasOtherTabOrders }: UserOrdersEmptyProps) => {
    if (variant === 'completed') {
        return (
            <div className={style['orders-empty']}>
                <span className={style['orders-empty__icon']} aria-hidden="true">
                    <FaRegCircleCheck />
                </span>
                <h3 className={style['orders-empty__title']}>No completed orders yet</h3>
                <p className={style['orders-empty__text']}>
                    Orders appear here once they&apos;re delivered or cancelled.
                </p>
                <Link
                    to={hasOtherTabOrders ? '/user/orders' : '/catalog'}
                    className={style['orders-empty__cta']}
                >
                    {hasOtherTabOrders ? 'See active orders' : 'Browse catalog'}
                </Link>
            </div>
        );
    }

    return (
        <div className={style['orders-empty']}>
            <span className={style['orders-empty__icon']} aria-hidden="true">
                <LuPackage />
            </span>
            <h3 className={style['orders-empty__title']}>No active orders</h3>
            <p className={style['orders-empty__text']}>
                {hasOtherTabOrders
                    ? 'Everything you\'ve ordered so far has been completed.'
                    : 'Once you place an order, you can track it here.'}
            </p>
            <Link
                to={hasOtherTabOrders ? '/user/orders?tab=completed' : '/catalog'}
                className={style['orders-empty__cta']}
            >
                {hasOtherTabOrders ? 'See completed orders' : 'Browse catalog'}
            </Link>
        </div>
    );
};
