import { FC } from 'react';
import { EnrichedOrderItem, Order } from '@/types/order';
import { OrderItem } from '../../../OrderItem/OrderItem';
import { OrderItemSkeleton } from '../../../OrderItem/OrderItemSkeleton';
import { OrderDetailsInfoCard } from '../OrderDetailsInfoCard/OrderDetailsInfoCard';
import style from './order-details-body.module.scss';



interface OrderDetailsBodyProps {
    order: Order;
    orderItems: EnrichedOrderItem[];
    isLoading: boolean;
    isFetching: boolean;
    ITEMS_PREVIEW_COUNT: number;
    variant: 'card' | 'drawer';
    onClose?(): void;

}
export const OrderDetailsBody: FC<OrderDetailsBodyProps> = ({
    order,
    orderItems,
    isLoading,
    isFetching,
    ITEMS_PREVIEW_COUNT,
    variant,
    onClose
}) => {
    return (
        <div className={`${style['body']} ${style[`body--${variant}`]}`}>
            <div className={style['body__info-grid']}>
                <OrderDetailsInfoCard
                    variant='delivery'
                    method={order.deliveryMethods.code}
                    status={order.deliveryStatus}
                    subtitle={
                        order.deliveryMethods.code === 'pickup'
                            ? 'The nearest pick-up point to you'
                            : `${order.shippingAddress.country}, ${order.shippingAddress.city}`
                    }
                />
                <OrderDetailsInfoCard
                    method={order.paymentMethod}
                    status={order.paymentStatus}
                    variant='payment'
                />
            </div>

            <div className={style['body__items-section']}>
                <div className={style['body__section-header']}>
                    <h3 className={style['body__section-title']}>
                        Goods
                    </h3>
                    <span className={style['body__items-count']}>
                        {orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}
                    </span>
                </div>

                <div className={style['body__scroll-area']}>
                    <div className={style['body__list']}>
                        {isLoading || isFetching ? (
                            <OrderItemSkeleton count={ITEMS_PREVIEW_COUNT} />
                        ) : (
                            orderItems.map((product) => (
                                <OrderItem key={product.id} item={product} onClose={onClose} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};