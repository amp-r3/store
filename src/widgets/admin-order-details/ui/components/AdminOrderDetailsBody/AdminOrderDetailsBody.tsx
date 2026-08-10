import { FC } from 'react';
import {
  EnrichedOrderItem,
  Order,
  OrderInfoCard,
  OrderItem,
  OrderItemSkeleton,
} from '@/entities/order';
import style from './admin-order-details-body.module.scss';
import { formatPrice } from '@/shared/lib';

interface AdminOrderDetailsBodyProps {
  order: Order;
  orderItems: EnrichedOrderItem[];
  isLoading: boolean;
  isFetching: boolean;
  ITEMS_PREVIEW_COUNT: number;
  goodsTotal: number;
}

const ADDRESS_FIELDS: (keyof Order['shippingAddress'])[] = [
  'street',
  'housenumber',
  'city',
  'postcode',
  'country',
];

export const AdminOrderDetailsBody: FC<AdminOrderDetailsBodyProps> = ({
  order,
  orderItems,
  isLoading,
  isFetching,
  ITEMS_PREVIEW_COUNT,
  goodsTotal,
}) => {
  const { firstName, lastName, email, phone } = order.shippingAddress;
  const isPickup = order.deliveryMethods.code === 'pickup';
  const addressLine = ADDRESS_FIELDS.map((field) => order.shippingAddress[field])
    .filter(Boolean)
    .join(', ');

  return (
    <div className={style['body']}>
      <div className={style['body__customer']}>
        <h3 className={style['body__section-title']}>Customer</h3>
        <p className={style['body__customer-name']}>
          {firstName} {lastName}
        </p>
        <p className={style['body__customer-line']}>{email}</p>
        {phone && <p className={style['body__customer-line']}>{phone}</p>}
        <p className={style['body__customer-line']}>
          {isPickup ? 'Pick-up point' : addressLine || 'No address on file'}
        </p>
      </div>

      <div className={style['body__info-grid']}>
        <OrderInfoCard
          variant="delivery"
          method={order.deliveryMethods.code}
          status={order.deliveryStatus}
          subtitle={isPickup ? 'The nearest pick-up point to the customer' : addressLine}
        />
        <OrderInfoCard
          method={order.paymentMethod}
          status={order.paymentStatus}
          variant="payment"
        />
      </div>

      <div className={style['body__items-section']}>
        <div className={style['body__section-header']}>
          <h3 className={style['body__section-title']}>Goods</h3>
          <span className={style['body__items-count']}>
            {orderItems.length} {orderItems.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className={style['body__scroll-area']}>
          <div className={style['body__list']}>
            {isLoading || isFetching ? (
              <OrderItemSkeleton count={ITEMS_PREVIEW_COUNT} />
            ) : (
              orderItems.map((item) => (
                <OrderItem key={item.id} item={item} linkToProduct={false} />
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

        <div className={`${style['body__receipt-row']} ${style['body__receipt-row--total']}`}>
          <span className={style['body__receipt-label']}>Total</span>
          <span className={style['body__receipt-value']}>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};
