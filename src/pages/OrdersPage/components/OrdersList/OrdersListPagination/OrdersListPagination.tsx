import style from './orders-list-pagination.module.scss'
import { FC } from 'react';
import { OrderCard } from '../../OrderCard/OrderCard';
import { OrdersListProps } from '../OrderList';
import { Pagination } from '@/components/products';



export const OrdersListPagination: FC<OrdersListProps> = ({ orders, selectedOrderId, formatOrderDate, onCardClick }) => {
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

            <Pagination
                totalItems={50}
                currentPage={1}
                itemsPerPage={10}
                onPageChange={() => { }}
            />
        </section>
    )
}