import { FC, useMemo } from 'react';
// Icons
import { IoAdd, IoRemove, IoTrashOutline } from 'react-icons/io5';
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
}

export const CartItem: FC<CartItemProps> = ({
    product,
    onIncrease,
    onDecrease,
    onRemove,
}) => {
    const { id, title, price, thumbnail, quantity, discountPercentage, } = product
    const totalPrice = useMemo(() => price * quantity, [price, quantity]);

    return (
        <article className={styles['cart-item']}>
            {/* --- Media Section --- */}
            <div className={styles['cart-item__media']}>
                <img
                    src={thumbnail}
                    alt={title}
                    className={styles['cart-item__image']}
                    loading="lazy"
                />
            </div>

            {/* --- Content Section --- */}
            <div className={styles['cart-item__content']}>

                {/* Header: Title & Price */}
                <div className={styles['cart-item__header']}>
                    <h3 className={styles['cart-item__title']}>{title}</h3>
                    <div className={styles['cart-item__price-wrapper']}>
                        <span className={styles['cart-item__price']}>
                            {formatPrice(totalPrice)}
                        </span>

                        {quantity > 1 && (
                            <span className={styles['cart-item__unit-price']}>
                                {formatPrice(price)} / pcs.
                            </span>
                        )}

                        {discountPercentage > 1 && (
                            <span className={styles['cart-item__discount']}>
                                -{Math.round(discountPercentage)}%
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions: Quantity Controls & Remove */}
                <div className={styles['cart-item__actions']}>

                    {/* Quantity Controller */}
                    <div className={styles['cart-item__quantity-ctrl']}>
                        <button
                            className={`${styles['cart-item__btn']} ${styles['cart-item__btn--qty']}`}
                            onClick={() => onDecrease(id)}
                            aria-label="Decrease quantity"
                        >
                            {quantity === 1 ? <IoTrashOutline size={18} /> : <IoRemove size={18} />}
                        </button>

                        <span className={styles['cart-item__quantity-value']}>{quantity}</span>

                        <button
                            className={`${styles['cart-item__btn']} ${styles['cart-item__btn--qty']}`}
                            onClick={() => onIncrease(id)}
                            aria-label="Increase quantity"
                        >
                            <IoAdd size={18} />
                        </button>
                    </div>

                    {/* Remove Button */}
                    <button
                        className={`${styles['cart-item__btn']} ${styles['cart-item__btn--remove']}`}
                        onClick={() => onRemove(id)}
                        aria-label="Remove item"
                    >
                        <IoTrashOutline size={22} />
                    </button>
                </div>
            </div>
        </article>
    );
};