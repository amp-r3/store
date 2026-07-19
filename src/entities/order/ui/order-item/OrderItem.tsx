import React from 'react';
import style from './order-item.module.scss';
import { EnrichedOrderItem } from '@/entities/order/model/types';
import { useGetSizesQuery } from '@/entities/product';
import { formatPrice } from '@/shared/lib';
import { Link } from 'react-router';

interface OrderItemProps {
  item: EnrichedOrderItem;
  onClose?(): void;
  /** Off when the row itself is the interactive element, so the two don't compete for the click. */
  linkToProduct?: boolean;
}

export const OrderItem: React.FC<OrderItemProps> = React.memo(({ item, onClose, linkToProduct = true }) => {
  const { product, quantity, priceAtPurchase, sizeId } = item;
  const { data: sizes } = useGetSizesQuery(product.id)
  const { value: selectedSize } = sizes?.find((size) => size.id === sizeId) ?? {}

  const itemTotal = quantity * priceAtPurchase;

  return (
    <article className={style['order-item']}>
      {linkToProduct && (
        <Link
          to={`/product/${item.product.id}`}
          className={style['order-item__link']}
          aria-label={`View details for ${product.title}`}
          onClick={onClose}
        />
      )}

      <div className={style['order-item__image-wrapper']}>
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className={style['order-item__image']}
          />
        ) : (
          <div className={style['order-item__image-placeholder']}>No photo</div>
        )}
      </div>

      <div className={style['order-item__info']}>
        <h3 className={style['order-item__title']} title={product.title}>
          {product.title}
        </h3>
        {product.category && (
          <span className={style['order-item__category']}>{product.category}</span>
        )}
        {(selectedSize && selectedSize !== 'One Size') && (
          <div className={style['order-item__size']}>
            <span className={style['order-item__size-label']}>Size:</span>
            <span className={style['order-item__size-value']}>{selectedSize}</span>
          </div>
        )}
      </div>

      <div className={style['order-item__price-block']}>
        {quantity > 1 && (
          <div className={style['order-item__price-per-item']}>
            {quantity} pc. × {formatPrice(priceAtPurchase)}
          </div>
        )}
        <strong className={style['order-item__total-price']}>
          {formatPrice(itemTotal)}
        </strong>
      </div>
    </article>
  );
});

OrderItem.displayName = 'OrderItem';