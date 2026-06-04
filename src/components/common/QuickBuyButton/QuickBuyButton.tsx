import React from 'react';
import { FaBolt, FaSpinner } from 'react-icons/fa';
import { useHaptics } from '@/hooks';
import styles from './quick-buy-button.module.scss';

interface QuickBuyButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  text?: string;
}

export const QuickBuyButton: React.FC<QuickBuyButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  className = '',
  text = 'Buy Now',
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
      aria-label={text}
    >
      {isLoading ? (
        <FaSpinner className={styles.spinning} />
      ) : (
        <FaBolt className={styles.icon} />
      )}
      <span className={styles.text}>{text}</span>
    </button>
  );
};
