import { FC, useState } from 'react';
import { EnrichedOrderItem, Order } from '@/types/order';
import style from './order-details.module.scss';
import { OrderItemSkeleton } from '../OrderItem/OrderItemSkeleton';
import { OrderItem } from '../OrderItem/OrderItem';
import { formatPrice } from '@/utils';
import { HiChevronDown } from 'react-icons/hi2';

const ITEMS_PREVIEW_COUNT = 3;

interface OrderDetailsProps {
  order: Order;
  isFetching: boolean;
  items: EnrichedOrderItem[];
  isItemsLoading: boolean;
  isItemsFetching: boolean;
  goodsTotal: number;
}

export const OrderDetails: FC<OrderDetailsProps> = ({
  order,
  isFetching,
  items,
  isItemsFetching,
  isItemsLoading,
  goodsTotal
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasMore = items.length > ITEMS_PREVIEW_COUNT;
  const visibleItems = isExpanded ? items : items.slice(0, ITEMS_PREVIEW_COUNT);
  const hiddenCount = items.length - ITEMS_PREVIEW_COUNT;

  return (
    <section className={style.orderDetails} aria-label="Order details">

      <header className={style.detailsHeader}>
        <div className={style.headerMain}>
          <h2>Order #{order.id.slice(0, 8).toUpperCase()}</h2>
          {isFetching && (
            <div className={style.updateOverlay} aria-live="polite">
              Updating
            </div>
          )}
        </div>
        <div className={style.orderStatus} data-status={order.status}>
          {order.status}
        </div>
      </header>

      <div className={style.infoBlocks}>
        <div className={style.infoCard}>
          <h3>Delivery</h3>
          <p>
            {order.shippingAddress?.city === 'N/A'
              ? 'City not specified'
              : order.shippingAddress?.city}
          </p>
          <p className={style.mutedText}>{order.deliveryMethods.label}</p>
        </div>

        <div className={style.infoCard}>
          <h3>Payment</h3>
          <p>{order.paymentMethod}</p>
          <p className={style.mutedText}>{order.paymentStatus}</p>
        </div>
      </div>

      <div className={style.itemsSection}>
        <h3>Items</h3>
        <div className={style.itemsList}>
          {isItemsLoading || isItemsFetching
            ? <OrderItemSkeleton count={ITEMS_PREVIEW_COUNT} />
            : visibleItems.map((product) => (
              <OrderItem key={product.id} item={product} />
            ))
          }
        </div>

        {!isItemsLoading && !isItemsFetching && hasMore && (
          <button
            className={style.expandButton}
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
          >
            <span>
              {isExpanded ? 'Show less' : `Show ${hiddenCount} more item${hiddenCount > 1 ? 's' : ''}`}
            </span>
            <HiChevronDown
              className={`${style.expandIcon} ${isExpanded ? style.expandIconRotated : ''}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <div className={style.summarySection}>
        <div className={style.summaryRow}>
          <span>Subtotal</span>
          <span>{formatPrice(goodsTotal)}</span>
        </div>
        <div className={style.summaryRow}>
          <span>Delivery</span>
          <span>{formatPrice(order.deliveryCost)}</span>
        </div>
        {order.paymentFee > 0 && (
          <div className={style.summaryRow}>
            <span>Payment fee</span>
            <span>{formatPrice(order.paymentFee)}</span>
          </div>
        )}
        <div className={`${style.summaryRow} ${style.totalRow}`}>
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>

    </section>
  );
};