import React from 'react';
import { FaBolt, FaSpinner } from 'react-icons/fa';
import { useHaptics } from '@/hooks';
import styles from './quick-buy-button.module.scss';

interface QuickBuyButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  size?: 'small' | 'large';
  className?: string;
  text?: string;
}

export const QuickBuyButton: React.FC<QuickBuyButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  size = 'large',
  className = '',
  text = 'Buy Now',
}) => {
  const { light } = useHaptics();
  const isSmall = size === 'small';

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
      className={`${styles.button} ${isSmall ? styles['is-small'] : ''} ${className}`}
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
