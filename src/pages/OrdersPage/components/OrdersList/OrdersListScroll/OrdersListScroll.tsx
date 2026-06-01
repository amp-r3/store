import style from './orders-list-scroll.module.scss'
import { OrderCard } from '../../OrderCard/OrderCard';
import { OrdersListProps } from '../OrderList';
import { FC } from 'react';

export const OrdersListScroll: FC<OrdersListProps> = ({ orders, selectedOrderId, formatOrderDate, onCardClick }) => {
    return (
        <section className={style['order-list']} role="listbox" aria-label="Orders">
            {orders.map((order) => {
                const isActive = order.id === selectedOrderId;

                return (
                    <OrderCard
                        orderId={order.id}
                        orderNumber={order.orderId}
                        orderDate={formatOrderDate(order.createdAt)}
                        orderStatus={order.status}
                        orderTotalAmount={order.totalAmount}
                        isActive={isActive}
                        onClick={onCardClick}
                        key={order.id} />
                );
            })}
        </section>
    )
}