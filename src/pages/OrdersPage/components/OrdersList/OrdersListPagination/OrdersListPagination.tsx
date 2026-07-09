import style from './orders-list-pagination.module.scss'
import { FC } from 'react';
import { OrderCard } from '../../OrderCard/OrderCard';
import { OrdersListProps } from '../OrderList';
import { Pagination } from '@/components/products';
import { OrderCardSkeleton } from '../../OrderCard/OrderCardSkeleton';

export const OrdersListPagination: FC<OrdersListProps> = ({
    orders,
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
    selectedOrderId,
    formatOrderDate,
    onCardClick,
    isLoading
}) => {
    return (
        <section className={style['order-list']} role="listbox" aria-label="Orders">
            {isLoading ? (
                <OrderCardSkeleton count={itemsPerPage} />
            ) : (
                orders.map((order) => (
                    <OrderCard
                        orderId={order.id}
                        orderNumber={order.orderId}
                        orderDate={formatOrderDate(order.createdAt)}
                        orderStatus={order.status}
                        orderTotalAmount={order.totalAmount}
                        isActive={order.id === selectedOrderId}
                        onClick={onCardClick}
                        key={order.id}
                    />
                ))
            )}

            {totalItems > itemsPerPage && (
                <div className={style['pagination-wrapper']}>
                    <Pagination
                        totalItems={totalItems}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </section>
    )
}