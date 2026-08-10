import { DeliveryMethod, DeliveryOptions, isDeliveryFree } from '@/entities/order';
import { RadioCard } from '@/shared/ui';
import style from './delivery-option.module.scss';
import { formatPrice } from '@/shared/lib';
import { FC } from 'react';

interface DeliveryOptionProps {
  option: DeliveryMethod;
  isSelected: boolean;
  cartTotal: number;
  handleSelect(id: string, code: DeliveryOptions): void;
}

export const DeliveryOption: FC<DeliveryOptionProps> = ({
  option,
  isSelected,
  cartTotal,
  handleSelect,
}) => {
  const isFree = isDeliveryFree(option, cartTotal);

  return (
    <RadioCard
      name="deliveryMethod"
      value={option.id}
      isSelected={isSelected}
      disabled={!option.isActive}
      onSelect={() => handleSelect(option.id, option.code)}
    >
      <span className={style['delivery-option__dot']}></span>
      <div className={style['delivery-option__info']}>
        <span className={style['delivery-option__label']}>
          {option.label}
          {!option.isActive && <span className={style['delivery-option__badge']}>Unavailable</span>}
        </span>
        <span className={style['delivery-option__duration']}>{option.duration}</span>
      </div>
      <span className={style['delivery-option__price']}>
        {isFree ? 'Free' : formatPrice(option.price)}
      </span>
    </RadioCard>
  );
};
