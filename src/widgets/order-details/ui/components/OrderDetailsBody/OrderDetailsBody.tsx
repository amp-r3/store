import { FC } from 'react';
import { EnrichedOrderItem, Order } from '@/entities/order';
import { OrderDetailsInfoCard } from '../OrderDetailsInfoCard/OrderDetailsInfoCard';
import style from './order-details-body.module.scss';
import { LuStar } from 'react-icons/lu';
import { formatPrice } from "@/shared/lib";
import { OrderItem } from "@/entities/order";
import { OrderItemSkeleton } from "@/entities/order";

interface OrderDetailsBodyProps {
    order: Order;
    orderItems: EnrichedOrderItem[];
    isLoading: boolean;
    isFetching: boolean;
    ITEMS_PREVIEW_COUNT: number;
    goodsTotal: number;
    onClose?(): void;
    onRateClick(): void;
}

export const OrderDetailsBody: FC<OrderDetailsBodyProps> = ({
    order,
    orderItems,
    isLoading,
    isFetching,
    ITEMS_PREVIEW_COUNT,
    goodsTotal,
    onClose,
    onRateClick,
}) => {
    return (
        <div className={style['body']}>
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
                    <div className={style['body__header-actions']}>
                        <span className={style['body__items-count']}>
                            {orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}
                        </span>
                        {
                            order.status === 'completed' &&
                            <button onClick={onRateClick} type="button" className={style['body__rate-btn']}>
                                <LuStar />
                                Rate this order
                            </button>
                        }
                    </div>
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

            <div className={style['body__receipt']}>
                <div className={style['body__receipt-row']}>
                    <span className={style['body__receipt-label']}>Cost of goods</span>
                    <span className={style['body__receipt-value']}>{formatPrice(goodsTotal)}</span>
                </div>

                <div className={style['body__receipt-row']}>
                    <span className={style['body__receipt-label']}>Delivery</span>
                    <span className={style['body__receipt-value']}>{formatPrice(order.deliveryCost)}</span>
                </div>

                {order.paymentFee > 0 && (
                    <div className={style['body__receipt-row']}>
                        <span className={style['body__receipt-label']}>Payment commission</span>
                        <span className={style['body__receipt-value']}>{formatPrice(order.paymentFee)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}