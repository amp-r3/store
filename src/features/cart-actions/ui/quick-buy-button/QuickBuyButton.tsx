import React from 'react';
import { useHaptics } from '@/shared/lib/hooks';
import { FaBolt, FaSpinner } from 'react-icons/fa';
import styles from './quick-buy-button.module.scss';

interface QuickBuyButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const QuickBuyButton: React.FC<QuickBuyButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  className = '',
}) => {
  const { light } = useHaptics();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isLoading) {
      light();
      onClick();
    }
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${className}`}
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-label="Buy Now"
    >
      {isLoading ? (
        <FaSpinner className={styles.spinning} />
      ) : (
        <FaBolt className={styles.icon} />
      )}
      <span className={styles.text}>Buy Now</span>
    </button>
  );
};
