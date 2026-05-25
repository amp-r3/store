import React from 'react';
import style from './order-item.module.scss';
import { EnrichedOrderItem } from '@/types/order';
import { formatPrice } from '@/utils';

interface OrderItemProps {
  item: EnrichedOrderItem;
}

export const OrderItem: React.FC<OrderItemProps> = ({ item }) => {
  const { product, quantity, priceAtPurchase } = item;

  const itemTotal = quantity * priceAtPurchase;

  return (
    <div className={style.orderItem}>
      <div className={style.imageWrapper}>
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className={style.image}
          />
        ) : (
          <div className={style.imagePlaceholder}>No photo</div>
        )}
      </div>

      <div className={style.info}>
        <h4 className={style.title} title={product.title}>
          {product.title}
        </h4>
        {product.category && (
          <span className={style.category}>{product.category}</span>
        )}
      </div>

      <div className={style.priceBlock}> 
        {
          quantity > 1 &&
          <div className={style.pricePerItem}>
            {quantity} pc. × {formatPrice(priceAtPurchase)}
          </div>
        }
        <div className={style.totalPrice}>
          {formatPrice(itemTotal)}
        </div>
      </div>
    </div>
  );
};