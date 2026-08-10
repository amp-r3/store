import { ReactNode } from 'react';
import style from './radio-card.module.scss';

export interface RadioCardProps {
  name: string;
  value: string;
  isSelected: boolean;
  onSelect(): void;
  disabled?: boolean;
  variant?: 'row' | 'tile';
  children: ReactNode;
}

export const RadioCard = ({
  name,
  value,
  isSelected,
  onSelect,
  disabled,
  variant = 'row',
  children,
}: RadioCardProps) => (
  <label
    className={[
      style['radio-card'],
      style[`radio-card--${variant}`],
      isSelected ? style['radio-card--active'] : '',
      disabled ? style['radio-card--disabled'] : '',
    ]
      .filter(Boolean)
      .join(' ')}
    data-selected={isSelected}
    data-disabled={disabled}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={isSelected}
      disabled={disabled}
      onChange={onSelect}
      className={style['radio-card__input']}
    />
    {children}
  </label>
);
