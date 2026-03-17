import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaPlus, FaMinus, FaSpinner } from 'react-icons/fa';
import styles from './add-to-cart-button.module.scss';

interface AddToCartButtonProps {
  quantity: number;
  onAddToCart: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  inStock?: boolean;
  isMaxReached?: boolean;
  size?: 'small' | 'large';
  className?: string;
  isLoading?: boolean;           
  buttonText?: string;           
  outOfStockText?: string;      
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  quantity = 0,
  onAddToCart,
  onIncrement,
  onDecrement,
  inStock = true,
  isMaxReached = false,
  size = 'large',
  className = '',
  isLoading = false,
  buttonText = 'Add to Cart',
  outOfStockText = 'Out of Stock',
}) => {
  const isSmall = size === 'small';
  const isActive = quantity > 0;
  const [animateQty, setAnimateQty] = useState(false);

  useEffect(() => {
    if (quantity > 0) {
      setAnimateQty(true);
      const timer = setTimeout(() => setAnimateQty(false), 350);
      return () => clearTimeout(timer);
    }
  }, [quantity]);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const displayAddText = !inStock && !isActive ? outOfStockText : buttonText;

  return (
    <div
      className={`${styles.container} ${isActive ? styles['is-active'] : ''} ${isSmall ? styles['is-small'] : ''} ${className}`}
    >
      <button
        type="button"
        className={styles['add-btn']}
        onClick={(e) => handleAction(e, onAddToCart)}
        disabled={!inStock || isMaxReached || isLoading}
        tabIndex={isActive ? -1 : 0}
        aria-hidden={isActive}
      >
        {isLoading ? (
          <FaSpinner className={`${styles.icon} ${styles.spinning}`} />
        ) : (
          <FaShoppingCart className={styles.icon} />
        )}
        <span className={styles.text}>{displayAddText}</span>
      </button>

      <div
        className={styles.counter}
        aria-hidden={!isActive}
      >
        <button
          type="button"
          className={styles['counter-btn']}
          onClick={(e) => handleAction(e, onDecrement)}
          disabled={isLoading}
          tabIndex={isActive ? 0 : -1}
          aria-label="Remove from cart"
        >
          <FaMinus />
        </button>

        <span className={`${styles['counter-qty']} ${animateQty ? styles['qty-pop'] : ''}`}>
          {quantity}
        </span>

        <button
          type="button"
          className={styles['counter-btn']}
          onClick={(e) => handleAction(e, onIncrement)}
          disabled={isMaxReached || isLoading}
          tabIndex={isActive ? 0 : -1}
          aria-label="Add more"
        >
          <FaPlus />
        </button>
      </div>
    </div>
  );
};