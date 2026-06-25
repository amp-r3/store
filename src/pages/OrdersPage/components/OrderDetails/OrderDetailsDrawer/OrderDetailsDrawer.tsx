import { FC } from 'react';
import { Drawer } from 'vaul';
import style from './order-details-drawer.module.scss';

import { OrderDetailsHeader } from '../components/OrderDetailsHeader/OrderDetailsHeader';
import { OrderDetailsBody } from '../components/OrderDetailsBody/OrderDetailsBody';
import { OrderDetailsFooter } from '../components/OrderDetailsFooter/OrderDetailsFooter';
import { OrderDetailsProps } from '../OrderDetails';

const ITEMS_PREVIEW_COUNT = 3;

interface OrderDetailsDrawerProps extends OrderDetailsProps {

}



export const OrderDetailsDrawer: FC<OrderDetailsDrawerProps> = ({
    open,
    order,
    isFetching,
    items,
    isItemsFetching,
    isItemsLoading,
    goodsTotal,
    onOpenChange,
    orderCartProduct,
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
                            goodsTotal={goodsTotal}
                            onClose={onOpenChange}
                        />

                        {/* ── MODERN STICKY FOOTER ── */}
                        <OrderDetailsFooter
                            orderCartProduct={orderCartProduct}
                            totalAmount={order.totalAmount}
                            variant='drawer'
                        />

                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};