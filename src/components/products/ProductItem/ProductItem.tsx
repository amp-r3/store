import { CartItem } from '@/types/products';
import styles from './product-item.module.scss';
import { formatPrice } from '@/utils';
import { useGetSizesQuery } from '@/services/productsApi';


interface ProductItemProps {
  product: CartItem;
}

const ProductItem = ({ product }: ProductItemProps) => {
  const { id, title, brand, thumbnail, price, basePrice, discountPercentage, quantity, sizeId } = product;
  const { data: sizes, isLoading } = useGetSizesQuery(id)
  const { value: selectedSize } = sizes?.find((size) => size.id === sizeId) ?? {}

  const hasDiscount = discountPercentage > 0;
  const totalPrice = price * quantity;

  return (
    <article className={styles['product-item']}>
      <div className={styles['product-item__image-wrapper']}>
        <img
          className={styles['product-item__image']}
          src={thumbnail}
          alt={title}
        />
        {hasDiscount && (
          <span className={styles['product-item__badge']}>
            -{discountPercentage}%
          </span>
        )}
      </div>

      <div className={styles['product-item__info']}>
        <p className={styles['product-item__brand']}>{brand}</p>
        <h4 className={styles['product-item__title']}>{title}</h4>

        {(selectedSize && selectedSize !== 'One Size') && (
          <div className={styles['product-item__size']}>
            <span className={styles['product-item__size-label']}>Size:</span>
            <span className={styles['product-item__size-value']}>{selectedSize}</span>
          </div>
        )}

        <div className={styles['product-item__pricing']}>
          <span className={styles['product-item__price']}>
            {formatPrice(price)}
          </span>
          {hasDiscount && (
            <span className={styles['product-item__price--original']}>
              {formatPrice(basePrice)}
            </span>
          )}
        </div>
      </div>

      <div className={styles['product-item__meta']}>
        <span className={styles['product-item__quantity']}>×{quantity}</span>
        <span className={styles['product-item__total']}>{formatPrice(totalPrice)}</span>
      </div>
    </article>
  );
};

export default ProductItem;