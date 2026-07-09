import React from 'react';
import style from './order-item.module.scss';
import { EnrichedOrderItem } from '@/types/order';
import { formatPrice } from '@/utils';
import { Link } from 'react-router';
import { useGetSizesQuery } from '@/services/productsApi';

interface OrderItemProps {
  item: EnrichedOrderItem;
  onClose?(): void;
}

export const OrderItem: React.FC<OrderItemProps> = ({ item, onClose }) => {
  const { product, quantity, priceAtPurchase, sizeId } = item;
  const { data: sizes, isLoading } = useGetSizesQuery(product.id)
  const { value: selectedSize } = sizes?.find((size) => size.id === sizeId) ?? {}

  const itemTotal = quantity * priceAtPurchase;

  return (
    <article className={style['order-item']}>
      <Link
        to={`/product/${item.product.id}`}
        className={style['order-item__link']}
        aria-label={`View details for ${product.title}`}
        onClick={onClose}
      />

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
};