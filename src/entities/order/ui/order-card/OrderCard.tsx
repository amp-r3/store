import { memo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { OrderItem, OrderStatus } from '@/entities/order/model/types';
import { ORDER_STATUS_MAP } from '@/entities/order/config/order-management.config';
import style from './order-card.module.scss';
import { formatPrice } from '@/shared/lib';
import { StatusBadge } from '@/shared/ui';

const MAX_THUMBNAILS = 3;

interface OrderCardProps {
  orderId: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  orderDate: string;
  orderTotalAmount: number;
  isActive: boolean;
  items: OrderItem[];
  thumbnailsById?: Record<number, string>;
  onClick(id: string): void;
}

export const OrderCard = memo(({
  orderId,
  orderNumber,
  orderStatus,
  orderDate,
  orderTotalAmount,
  isActive,
  items,
  thumbnailsById,
  onClick,
}: OrderCardProps) => {
  const visibleItems = items.slice(0, MAX_THUMBNAILS);
  const extraCount = items.length - visibleItems.length;

  return (
    <article
      role="listitem"
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
        <StatusBadge
          status={orderStatus}
          label={ORDER_STATUS_MAP[orderStatus]?.label ?? orderStatus}
          ariaLabel={`Order status: ${ORDER_STATUS_MAP[orderStatus]?.label ?? orderStatus}`}
        />
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

      {visibleItems.length > 0 && (
        <div className={style.thumbnails}>
          {visibleItems.map((item) => (
            thumbnailsById ? (
              <img
                key={item.id}
                className={style.thumbnail}
                src={thumbnailsById[item.productId]}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
            ) : (
              <Skeleton
                key={item.id}
                className={style.thumbnail}
                width={44}
                height={44}
                borderRadius={8}
                baseColor="var(--skeleton-base)"
                highlightColor="var(--skeleton-highlight)"
              />
            )
          ))}
          {extraCount > 0 && (
            <span className={style.thumbnailExtra} aria-hidden="true">
              +{extraCount}
            </span>
          )}
        </div>
      )}
    </article>
  );
});

OrderCard.displayName = 'OrderCard';
