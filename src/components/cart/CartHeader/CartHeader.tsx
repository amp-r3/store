import { FC, useEffect, useState } from 'react';
import { IoClose, IoCartOutline, IoTrashOutline } from 'react-icons/io5';
import styles from './cart-header.module.scss';

interface CartHeaderProps {
    totalQuantity: number;
    onClose: () => void;
    onClearCart?: () => void;
}

export const CartHeader: FC<CartHeaderProps> = ({
    totalQuantity,
    onClose,
    onClearCart,
}) => {
    const [isBumping, setIsBumping] = useState(false);
    const isCartEmpty = totalQuantity === 0;

    useEffect(() => {
        if (totalQuantity === 0) return;
        setIsBumping(true);
        const timer = setTimeout(() => setIsBumping(false), 300);
        return () => clearTimeout(timer);
    }, [totalQuantity]);

    return (
        <header className={styles.header}>
            <div className={styles.headerContent}>
                <div className={styles.titleWrapper}>
                    <h2 className={styles.title}>
                        <IoCartOutline size={28} aria-hidden="true" />
                        Cart
                        <span
                            className={`${styles.count} ${isCartEmpty ? styles.empty : ''} ${isBumping ? styles.bump : ''}`}
                            aria-hidden="true"
                        >
                            {totalQuantity}
                        </span>
                        <span className={styles.srOnly}>
                            {totalQuantity} items in cart
                        </span>
                    </h2>
                </div>

                <div className={styles.actions}>
                    {!isCartEmpty && onClearCart && (
                        <button
                            className={styles.clearBtn}
                            onClick={onClearCart}
                            aria-label="Clear cart"
                        >
                            <IoTrashOutline size={18} />
                            <span>Clear</span>
                        </button>
                    )}
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close cart">
                        <IoClose size={24} />
                    </button>
                </div>
            </div>
        </header>
    );
};