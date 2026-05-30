import { FC } from 'react';
import { Drawer } from 'vaul';
import { EnrichedOrderItem, Order } from '@/types/order';
import style from './order-details-drawer.module.scss';

import { OrderDetailsHeader } from '../components/OrderDetailsHeader/OrderDetailsHeader';
import { OrderDetailsBody } from '../components/OrderDetailsBody/OrderDetailsBody';
import { OrderDetailsFooter } from '../components/OrderDetailsFooter/OrderDetailsFooter';

const ITEMS_PREVIEW_COUNT = 3;

interface OrderDetailsProps {
    open: boolean;
    order: Order;
    isFetching: boolean;
    items: EnrichedOrderItem[];
    isItemsLoading: boolean;
    isItemsFetching: boolean;
    goodsTotal: number;
    onOpenChange(): void;
    formatOrderDate(date: string): string;
}

export const OrderDetailsDrawer: FC<OrderDetailsProps> = ({
    open,
    order,
    isFetching,
    items,
    isItemsFetching,
    isItemsLoading,
    goodsTotal,
    onOpenChange,
    formatOrderDate,
}) => {

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange} direction="bottom">
            <Drawer.Portal>
                <Drawer.Overlay className={style['order-drawer__overlay']} />

                <Drawer.Content className={style['order-drawer__content']} aria-label="Order details">
                    <Drawer.Handle className={style['order-drawer__handle']} />

                    <div className={style['order-drawer__layout']}>

                        {/* ── STICKY HEADER ── */}
                        <OrderDetailsHeader
                            orderId={order.orderId}
                            orderStatus={order.status}
                            isFetching={isFetching || isItemsFetching}
                            orderDate={formatOrderDate(order.createdAt)}
                            variant='drawer' />

                        {/* ── SCROLLABLE BODY ── */}
                        <OrderDetailsBody
                            variant='drawer'
                            order={order}
                            orderItems={items}
                            isLoading={isItemsLoading}
                            isFetching={isItemsFetching}
                            ITEMS_PREVIEW_COUNT={ITEMS_PREVIEW_COUNT}
                            onClose={onOpenChange}
                        />

                        {/* ── MODERN STICKY FOOTER ── */}
                        <OrderDetailsFooter
                            goodsTotal={goodsTotal}
                            deliveryCost={order.deliveryCost}
                            paymentFee={order.paymentFee}
                            totalAmount={order.totalAmount}
                            variant='drawer'
                        />

                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};