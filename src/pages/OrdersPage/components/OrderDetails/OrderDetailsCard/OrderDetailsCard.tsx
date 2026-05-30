import { FC } from 'react';
import { EnrichedOrderItem, Order } from '@/types/order';
import style from './order-details-card.module.scss';


import { OrderDetailsHeader } from '../components/OrderDetailsHeader/OrderDetailsHeader';
import { OrderDetailsBody } from '../components/OrderDetailsBody/OrderDetailsBody';
import { OrderDetailsFooter } from '../components/OrderDetailsFooter/OrderDetailsFooter';

const ITEMS_PREVIEW_COUNT = 3;

interface OrderDetailsProps {
    order: Order;
    isFetching: boolean;
    items: EnrichedOrderItem[];
    isItemsLoading: boolean;
    isItemsFetching: boolean;
    goodsTotal: number;
    formatOrderDate(date: string): string;
}

export const OrderDetailsCard: FC<OrderDetailsProps> = ({
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