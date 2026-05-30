import { FC } from 'react';
import { OrderStatus } from '@/types/order';
import style from './order-card.module.scss';
import { formatPrice } from '@/utils';

interface OrderCardProps {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  orderDate: string;
  orderTotalAmount: number;
  isActive: boolean;
  onClick(id: string): void;
}

export const OrderCard: FC<OrderCardProps> = ({
  orderId,
  orderNumber,
  orderStatus,
  orderDate,
  orderTotalAmount,
  isActive,
  onClick,
}) => {
  return (
    <article
      role="option"
      aria-selected={isActive}
      tabIndex={0}
      className={`${style.orderCard} ${isActive ? style.activeCard : ''}`}
      onClick={() => onClick(orderId)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(orderId);
        }
      }}
    >
      <div className={style.mainInfo}>
        <div
          className={`${style['orderStatus']} ${style[`orderStatus--${orderStatus}`]}`}
          aria-label={`Order status: ${orderStatus}`}
          data-status={orderStatus}>
          {orderStatus}
        </div>
        <div className={style.orderTotal}>
          {formatPrice(orderTotalAmount)}
        </div>
      </div>

      <div className={style.metaInfo}>
        <span className={style.orderNumber}>
          #{orderNumber}
        </span>
        <span className={style.orderDate}>
          {orderDate}
        </span>
      </div>
    </article>
  );
};