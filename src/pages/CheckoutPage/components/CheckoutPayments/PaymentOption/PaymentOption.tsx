import { PaymentMethod, PaymentOptions } from '@/types/checkout'
import style from './payment-option.module.scss'
import { FC } from 'react';

interface PaymentOptionProps {
  option: PaymentMethod;
  isSelected: boolean;
  icon: React.ReactNode;
  label: string;
  handleSelect(id: string, code: PaymentOptions): void
}

export const PaymentOption: FC<PaymentOptionProps> = ({ option, isSelected, icon, label, handleSelect }) => {
  return (
    <label
      key={option.id}
      className={`${style['payment__option']} ${isSelected ? style['payment__option--active'] : ''}`}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={option.id}
        onChange={() => handleSelect(option.id, option.code)}
        className={style['payment__option__radio']}
      />
      <span className={style['payment__option__icon']}>{icon}</span>
      <span className={style['payment__option__label']}>{label}</span>
    </label>
  )
}