import { FC } from 'react';
import { Drawer } from 'vaul';
import { VisuallyHidden } from 'radix-ui';
import { IoClose } from 'react-icons/io5';
import { AdminOrderDetailsHeader, AdminOrderDetailsBody, AdminOrderDetailsFooter } from "../components";
import { OrderProgress, OrderStatusEvent } from '@/entities/order';
import { formatDate } from '@/shared/lib';
import style from './admin-order-details-drawer.module.scss';
import { AdminOrderDetailsProps } from '../AdminOrderDetails';

const ITEMS_PREVIEW_COUNT = 3;
const MODAL_ROOT = document.getElementById('modal-root')!;

type AdminOrderDetailsDrawerProps = AdminOrderDetailsProps & {
    direction: 'bottom' | 'right';
    goodsTotal: number;
    events: OrderStatusEvent[];
    isEventsLoading: boolean;
};

export const AdminOrderDetailsDrawer: FC<AdminOrderDetailsDrawerProps> = ({
    open,
    order,
    isFetching,
    items,
    isItemsFetching,
    isItemsLoading,
    goodsTotal,
    onOpenChange,
    direction,
    events,
    isEventsLoading,
}) => {

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange} direction={direction}>
            <Drawer.Portal container={MODAL_ROOT}>
                <Drawer.Overlay className={style['admin-order-drawer__overlay']} />

                <Drawer.Content
                    className={`${style['admin-order-drawer__content']} ${style[`admin-order-drawer__content--${direction}`]}`}
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
                        <Drawer.Handle className={style['admin-order-drawer__handle']} />
                    )}

                    <Drawer.Close asChild>
                        <button className={style['admin-order-drawer__close']} aria-label="Close order details">
                            <IoClose size={20} />
                        </button>
                    </Drawer.Close>

                    <div className={style['admin-order-drawer__layout']}>

                        {/* ── STICKY HEADER ── */}
                        <AdminOrderDetailsHeader
                            orderId={order.orderId}
                            orderStatus={order.status}
                            isFetching={isFetching || isItemsFetching}
                            orderDate={formatDate(order.createdAt, 'full')}
                            updatedDate={formatDate(order.updatedAt, 'full')}
                        />

                        {/* ── STICKY PROGRESS ── */}
                        <OrderProgress order={order} events={events} isLoading={isEventsLoading} />

                        {/* ── SCROLLABLE BODY ── */}
                        <AdminOrderDetailsBody
                            order={order}
                            orderItems={items}
                            isLoading={isItemsLoading}
                            isFetching={isItemsFetching}
                            ITEMS_PREVIEW_COUNT={ITEMS_PREVIEW_COUNT}
                            goodsTotal={goodsTotal}
                        />

                        {/* ── STATUS FOOTER ── */}
                        <AdminOrderDetailsFooter order={order} />

                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};
