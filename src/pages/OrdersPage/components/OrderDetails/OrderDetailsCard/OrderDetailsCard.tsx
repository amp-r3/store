import { FC } from 'react';
import style from './order-details-card.module.scss';

import { OrderDetailsHeader } from '../components/OrderDetailsHeader/OrderDetailsHeader';
import { OrderDetailsBody } from '../components/OrderDetailsBody/OrderDetailsBody';
import { OrderDetailsFooter } from '../components/OrderDetailsFooter/OrderDetailsFooter';
import { OrderDetailsProps } from '../OrderDetails';

const ITEMS_PREVIEW_COUNT = 3;

type OrderDetailsCardProps = Omit<OrderDetailsProps, 'open' | 'onOpenChange'>

export const OrderDetailsCard: FC<OrderDetailsCardProps> = ({
    order,
    isFetching,
    items,
    isItemsFetching,
    isItemsLoading,
    goodsTotal,
    formatOrderDate
}) => {

    return (
        <section className={style['order-card']} aria-label="Order details">

            {/* ── HEADER ── */}
            <OrderDetailsHeader
                orderId={order.orderId}
                orderStatus={order.status}
                isFetching={isFetching || isItemsFetching}
                orderDate={formatOrderDate(order.createdAt)}
                variant='card' />

            {/* ── BODY ── */}
            <OrderDetailsBody
                variant='card'
                order={order}
                orderItems={items}
                isLoading={isItemsLoading}
                isFetching={isItemsFetching}
                ITEMS_PREVIEW_COUNT={ITEMS_PREVIEW_COUNT}
            />

            {/* ── FOOTER ── */}
            <OrderDetailsFooter
                goodsTotal={goodsTotal}
                deliveryCost={order.deliveryCost}
                paymentFee={order.paymentFee}
                totalAmount={order.totalAmount}
                variant='card'
            />

        </section>
    );
};