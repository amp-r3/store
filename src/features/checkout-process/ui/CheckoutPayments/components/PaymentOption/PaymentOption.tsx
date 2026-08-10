import { PaymentMethod, PaymentOptions } from '@/entities/order';
import { RadioCard } from '@/shared/ui';
import style from './payment-option.module.scss';
import { FC } from 'react';

interface PaymentOptionProps {
  option: PaymentMethod;
  isSelected: boolean;
  icon: React.ReactNode;
  label: string;
  handleSelect(id: string, code: PaymentOptions): void;
}

export const PaymentOption: FC<PaymentOptionProps> = ({
  option,
  isSelected,
  icon,
  label,
  handleSelect,
}) => {
  return (
    <RadioCard
      variant="tile"
      name="paymentMethod"
      value={option.id}
      isSelected={isSelected}
      onSelect={() => handleSelect(option.id, option.code)}
    >
      <span className={style['payment__option__icon']}>{icon}</span>
      <span className={style['payment__option__label']}>{label}</span>
    </RadioCard>
  );
};
