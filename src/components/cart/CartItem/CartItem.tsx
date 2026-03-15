import { FC, useMemo } from 'react';
// Icons
import { IoAdd, IoRemove, IoTrashOutline, IoWarningOutline } from 'react-icons/io5';
// Styles
import styles from './cart-item.module.scss';
// Types
import { CartItem as CartItemType } from '@/types/products';
import { formatPrice } from '@/utils';

interface CartItemProps {
    product: CartItemType;
    onIncrease: (id: number) => void;
    onDecrease: (id: number) => void;
    onRemove: (id: number) => void;
    isMaxValue: boolean;
}

const getOptimizedImageUrl = (originalUrl: string, width: number = 300) => {
    return `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=${width}&fit=contain&we`;
};

export const CartItem: FC<CartItemProps> = ({
    product,
    onIncrease,
    onDecrease,
    onRemove,
    isMaxValue
}) => {
    const { id, title, price, thumbnail, quantity, discountPercentage } = product;
    const totalPrice = useMemo(() => price * quantity, [price, quantity]);
    const imageUrl = getOptimizedImageUrl(thumbnail);

    return (
        <article className={styles['cart-item']}>
            {/* --- Media Section --- */}
            <div className={styles['cart-item__media']}>
                <img
                    src={imageUrl}
                    alt={title}
                    className={styles['cart-item__image']}
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="300"
                />
            </div>

            {/* --- Content Section --- */}
            <div className={styles['cart-item__content']}>

                {/* Header: Title & Prices */}
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

                {/* Footer: Quantity Controls, Hints & Remove */}
                <div className={styles['cart-item__footer']}>
                    <div className={styles['cart-item__quantity-ctrl']}>
                        <button
                            className={`${styles['cart-item__btn']} ${styles['cart-item__btn--qty']}`}
                            onClick={() => onDecrease(id)}
                            aria-label="Decrease quantity"
                        >
                            {quantity === 1 ? <IoTrashOutline size={16} /> : <IoRemove size={18} />}
                        </button>

                        <span className={styles['cart-item__quantity-value']}>{quantity}</span>

                        <button
                            className={`${styles['cart-item__btn']} ${styles['cart-item__btn--qty']}`}
                            onClick={() => onIncrease(id)}
                            aria-label="Increase quantity"
                            disabled={isMaxValue}
                            aria-disabled={isMaxValue}
                        >
                            <IoAdd size={18} />
                        </button>
                    </div>

                    {isMaxValue && (
                        <div className={styles['cart-item__stock-hint']} role="status" aria-live="polite">
                            <IoWarningOutline size={13} aria-hidden="true" />
                            <span>Max</span>
                        </div>
                    )}

                    <button
                        className={`${styles['cart-item__btn']} ${styles['cart-item__btn--remove']}`}
                        onClick={() => onRemove(id)}
                        aria-label="Remove item"
                    >
                        <IoTrashOutline size={24} />
                    </button>
                </div>
            </div>
        </article>
    );
};