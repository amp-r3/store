import { FC } from 'react';
import { Drawer } from 'vaul';
import { VisuallyHidden } from 'radix-ui';
import { IoClose } from 'react-icons/io5';
import { OrderDetailsHeader, OrderDetailsBody, OrderDetailsFooter } from "../components";
import { OrderProgress, OrderStatusEvent } from '@/entities/order';
import { getModalRoot } from '@/shared/lib';
import style from './order-details-drawer.module.scss';
import { OrderDetailsProps } from '../OrderDetails';

const ITEMS_PREVIEW_COUNT = 3;

type OrderDetailsDrawerProps = OrderDetailsProps & {
    direction: 'bottom' | 'right';
    events: OrderStatusEvent[];
    isEventsLoading: boolean;
};

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
    onRateClick,
    direction,
    events,
    isEventsLoading,
}) => {
    const modalRoot = getModalRoot();

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange} direction={direction}>
            <Drawer.Portal container={modalRoot}>
                <Drawer.Overlay className={style['order-drawer__overlay']} />

                <Drawer.Content
                    className={`${style['order-drawer__content']} ${style[`order-drawer__content--${direction}`]}`}
                    aria-describedby={undefined}
                    onOpenAutoFocus={(e) => {
                        e.preventDefault();
                        if (document.activeElement instanceof HTMLElement) {
                            document.activeElement.blur();
                        }
                    }}
                >
                    <VisuallyHidden.Root>
                        <Drawer.Title>Order details</Drawer.Title>
                    </VisuallyHidden.Root>

                    {direction === 'bottom' && (
                        <Drawer.Handle className={style['order-drawer__handle']} />
                    )}

                    <Drawer.Close asChild>
                        <button className={style['order-drawer__close']} aria-label="Close order details">
                            <IoClose size={20} />
                        </button>
                    </Drawer.Close>

                    <div className={style['order-drawer__layout']}>

                        {/* ── STICKY HEADER ── */}
                        <OrderDetailsHeader
                            orderId={order.orderId}
                            orderStatus={order.status}
                            isFetching={isFetching || isItemsFetching}
                            orderDate={formatOrderDate(order.createdAt)} />

                        {/* ── STICKY PROGRESS ── */}
                        <OrderProgress order={order} events={events} isLoading={isEventsLoading} />

                        {/* ── SCROLLABLE BODY ── */}
                        <OrderDetailsBody
                            order={order}
                            orderItems={items}
                            isLoading={isItemsLoading}
                            isFetching={isItemsFetching}
                            ITEMS_PREVIEW_COUNT={ITEMS_PREVIEW_COUNT}
                            goodsTotal={goodsTotal}
                            onClose={onOpenChange}
                            onRateClick={onRateClick}
                        />

                        {/* ── MODERN STICKY FOOTER ── */}
                        <OrderDetailsFooter
                            orderCartProduct={orderCartProduct}
                            totalAmount={order.totalAmount}
                        />

                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};
