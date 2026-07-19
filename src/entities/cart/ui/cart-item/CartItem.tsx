import { memo } from 'react';
// Icons
import { IoAdd, IoRemove, IoTrashOutline, IoWarningOutline } from 'react-icons/io5';
// Styles
import styles from './cart-item.module.scss';
// Types
import { CartItemDetails as CartItemType } from '@/entities/cart/model/types';
import { formatPrice } from '@/shared/lib';
import { Link } from 'react-router';
import { useGetSizesQuery } from "@/entities/product";
import { useAppSelector } from "@/shared/model";
import { selectIsMaxReached } from "@/entities/cart";

interface CartItemProps {
    product: CartItemType;
    onIncrease?: (sizeId: number, productId: number) => void;
    onDecrease?: (sizeId: number, productId: number) => void;
    onRemove?: (sizeId: number) => void;
    onClose?: () => void;
    readonly?: boolean;
}

export const CartItem = memo<CartItemProps>(({
    product,
    onIncrease,
    onDecrease,
    onRemove,
    onClose,
    readonly = false,
}) => {

    const { id, title, price, thumbnail, quantity, discountPercentage, sizeId } = product;
    const { data: sizes } = useGetSizesQuery(id)
    const selectedSize = sizes?.find((size) => size.id === sizeId)
    const stock = selectedSize?.stock

    const totalPrice = price * quantity;

    const isMaxReached = useAppSelector(() => selectIsMaxReached(quantity ?? 0, stock ?? 0));

    return (
        <article className={`${styles['cart-item']} ${readonly ? styles['cart-item--readonly'] : ''}`.trim()}>
            <Link to={`/product/${id}`} className={styles['cart-item__link']} aria-label={`View details for ${title}`} onClick={onClose} />

            {/* --- Media Section --- */}

            <div className={styles['cart-item__media']}>
                <img
                    src={thumbnail}
                    alt={title}
                    className={styles['cart-item__image']}
                    loading="lazy"
                    decoding="async"
                    width="108"
                    height="108"
                />
            </div>

            {/* --- Content Section --- */}
            <div className={styles['cart-item__content']}>
                <div className={styles['cart-item__header']}>
                    <h3 className={styles['cart-item__title']} title={title}>
                        {title}
                    </h3>

                    <div className={styles['cart-item__price-group']}>
                        <span className={styles['cart-item__price']}>
                            {formatPrice(totalPrice)}
                        </span>

                        <div className={styles['cart-item__price-details']}>
                            {quantity > 1 && (
                                <span className={styles['cart-item__unit-price']}>
                                    {formatPrice(price)} / pc.
                                </span>
                            )}

                            {discountPercentage > 1 && (
                                <span className={styles['cart-item__discount']}>
                                    -{Math.round(discountPercentage)}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                {!readonly && (
                <div className={styles['cart-item__footer']}>
                    <div className={styles['cart-item__quantity-ctrl']}>
                        <button
                            className={`${styles['cart-item__btn']} ${styles['cart-item__btn--qty']}`}
                            onClick={() => onDecrease?.(sizeId, id)}
                            aria-label="Decrease quantity"
                        >
                            {quantity === 1 ? <IoTrashOutline size={16} /> : <IoRemove size={18} />}
                        </button>

                        <span className={styles['cart-item__quantity-value']}>{quantity}</span>

                        <button
                            className={`${styles['cart-item__btn']} ${styles['cart-item__btn--qty']}`}
                            onClick={() => onIncrease?.(sizeId, id)}
                            aria-label="Increase quantity"
                            disabled={isMaxReached}
                            aria-disabled={isMaxReached}
                        >
                            <IoAdd size={18} />
                        </button>
                    </div>

                    {(selectedSize?.value && selectedSize?.value !== 'One Size') && (
                        <div className={styles['cart-item__size']}>
                            <span className={styles['cart-item__size-label']}>Size:</span>
                            <span className={styles['cart-item__size-value']}>{selectedSize.value}</span>
                        </div>
                    )}

                    {isMaxReached && (
                        <div className={styles['cart-item__stock-hint']} role="status" aria-live="polite">
                            <IoWarningOutline size={13} aria-hidden="true" />
                            <span>Max</span>
                        </div>
                    )}

                    <button
                        className={`${styles['cart-item__btn']} ${styles['cart-item__btn--remove']}`}
                        onClick={() => onRemove?.(sizeId)}
                        aria-label="Remove item"
                    >
                        <IoTrashOutline size={24} />
                    </button>
                </div>
                )}
            </div>
        </article>
    );
});

CartItem.displayName = 'CartItem';