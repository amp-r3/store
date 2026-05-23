import { DeliveryMethod, DeliveryOptions } from '@/types/checkout'
import style from './delivery-option.module.scss'
import { formatPrice } from '@/utils';
import { FC } from 'react';

interface DeliveryOptionProps {
  option: DeliveryMethod;
  isSelected: boolean;
  handleSelect(id: string, code: DeliveryOptions): void;
}

export const DeliveryOption: FC<DeliveryOptionProps> = ({ option, isSelected, handleSelect }) => {
  return (
    <label
      key={option.id}
      className={[
        style['delivery-option'],
        isSelected ? style['delivery-option--active'] : '',
        !option.isActive ? style['delivery-option--disabled'] : '',
      ].filter(Boolean).join(' ')}
    >
      <input
        type="radio"
        name="deliveryMethod"
        value={option.id}
        disabled={!option.isActive}
        className={style['delivery-option__radio']}
        onChange={() => handleSelect(option.id, option.code)}
      />
      <span className={style['delivery-option__dot']}></span>
      <div className={style['delivery-option__info']}>
        <span className={style['delivery-option__label']}>
          {option.label}
          {!option.isActive && (
            <span className={style['delivery-option__badge']}>
              Unavailable
            </span>
          )}
        </span>
        <span className={style['delivery-option__duration']}>{option.duration}</span>
      </div>
      <span className={style['delivery-option__price']}>
        {option.price === 0 ? 'Free' : `${formatPrice(option.price)}`}
      </span>
    </label>
  )
}