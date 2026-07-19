import style from './orders-list-pagination.module.scss'
import { FC } from 'react';
import { OrderCard } from '@/entities/order';
import { OrdersListProps } from '../OrderList';
import { Pagination } from "@/shared/ui";
import { OrderCardSkeleton } from "@/entities/order";

const MAX_STAGGER_INDEX = 8;

export const OrdersListPagination: FC<OrdersListProps> = ({
    orders,
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
    selectedOrderId,
    thumbnailsById,
    formatOrderDate,
    onCardClick,
    isLoading
}) => {
    return (
        <section className={style['order-list']} role="list" aria-label="Orders">
            {isLoading ? (
                <OrderCardSkeleton count={itemsPerPage} />
            ) : (
                orders.map((order, index) => (
                    <div
                        key={order.id}
                        className={style['order-list__item']}
                        style={{ animationDelay: `${Math.min(index, MAX_STAGGER_INDEX) * 40}ms` }}
                    >
                        <OrderCard
                            orderId={order.id}
                            orderNumber={order.orderId}
                            orderDate={formatOrderDate(order.createdAt)}
                            orderStatus={order.status}
                            orderTotalAmount={order.totalAmount}
                            items={order.orderItems}
                            thumbnailsById={thumbnailsById}
                            isActive={order.id === selectedOrderId}
                            onClick={onCardClick}
                        />
                    </div>
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
