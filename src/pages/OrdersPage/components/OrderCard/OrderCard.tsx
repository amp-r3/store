import { FC } from 'react';
import { Order } from '@/types/order';
import style from './order-card.module.scss';
import { formatPrice } from '@/utils';

interface OrderCardProps {
  order: Order;
  isActive: boolean;
  setSelectedOrderId(id: string): void;
  formatOrderDate(dateStr: string): string;
}

export const OrderCard: FC<OrderCardProps> = ({
  order,
  isActive,
  setSelectedOrderId,
  formatOrderDate
}) => {
  return (
    <article
      key={order.id}
      role="option"
      aria-selected={isActive}
      tabIndex={0}
      className={`${style.orderCard} ${isActive ? style.activeCard : ''}`}
      onClick={() => setSelectedOrderId(order.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setSelectedOrderId(order.id);
        }
      }}
    >
      <div className={style.mainInfo}>
        <div className={style.orderStatus} data-status={order.status}>
          {order.status}
        </div>
        <div className={style.orderTotal}>
          {formatPrice(order.totalAmount)}
        </div>
      </div>

      <div className={style.metaInfo}>
        <span className={style.orderNumber}>
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
        <span className={style.orderDate}>
          {formatOrderDate(order.createdAt)}
        </span>
      </div>
    </article>
  );
};