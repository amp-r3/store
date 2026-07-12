import style from './orders-list-scroll.module.scss'
import { OrderCard } from '../../../entities/order/ui/order-card/OrderCard';
import { OrdersListProps } from '../OrderList';
import { FC, useEffect, useRef } from 'react';
import { OrderCardSkeleton } from "@/entities/order";

export const OrdersListScroll: FC<OrdersListProps> = ({
    orders,
    selectedOrderId,
    formatOrderDate,
    onCardClick,
    onLoadMore,
    hasMore,
    isLoading,
    isFetching
}) => {
    const triggerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isFetching) {
                    onLoadMore();
                }
            },
            { rootMargin: '100px' }
        );

        if (triggerRef.current) {
            observer.observe(triggerRef.current);
        }

        return () => {
            if (triggerRef.current) {
                observer.unobserve(triggerRef.current);
            }
        };
    }, [hasMore, isFetching, onLoadMore]);

    return (
        <section
            className={`${style['order-list']} ${isFetching ? 'scroll-loader' : ''}`}
            role="listbox"
            aria-label="Orders"
        >
            {isLoading ? (
                <OrderCardSkeleton count={4} />
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

            {!isLoading && isFetching && (
                <OrderCardSkeleton count={3} />
            )}

            <div ref={triggerRef} className={style['scroll-trigger']} />

            {!isLoading && !hasMore && orders.length > 0 && (
                <p className={style['end-of-list']}>All orders have been loaded.</p>
            )}
        </section>
    )
}