import { OrderDetailsHeader, OrderDetailsBody, OrderDetailsFooter } from "../components";
import { FC } from 'react';
import style from './order-details-card.module.scss';
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
    orderCartProduct,
    formatOrderDate,
    onRateClick,
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
                goodsTotal={goodsTotal}
                onRateClick={onRateClick}
            />

            {/* ── FOOTER ── */}
            <OrderDetailsFooter
                orderCartProduct={orderCartProduct}
                totalAmount={order.totalAmount}
                variant='card'
            />

        </section>
    );
};