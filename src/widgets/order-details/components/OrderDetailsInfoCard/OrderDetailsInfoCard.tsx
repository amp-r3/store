import { FC } from 'react';
import {
    PAYMENT_CONFIG,
    DELIVERY_CONFIG,
    PAYMENT_STATUS_MAP,
    DELIVERY_STATUS_MAP
} from '@/entities/order';
import { DeliveryStatus, PaymentStatus } from '@/entities/order/model/types';
import { DeliveryOptions, PaymentOptions } from '@/entities/order';
import style from './order-details-info-card.module.scss';

interface OrderDetailsInfoCardProps {
    variant: 'delivery' | 'payment';
    method: DeliveryOptions | PaymentOptions | string;
    status: DeliveryStatus | PaymentStatus | string;
    subtitle?: string;
}

export const OrderDetailsInfoCard: FC<OrderDetailsInfoCardProps> = ({
    variant,
    method,
    status,
    subtitle
}) => {
    const isDelivery = variant === 'delivery';
    const cardTitle = isDelivery ? 'Delivery Info' : 'Payment Info';

    const methodData = isDelivery
        ? DELIVERY_CONFIG.find(item => item.id === method)
        : PAYMENT_CONFIG.find(item => item.id === method);

    const finalMethodLabel = methodData?.label || method.replace(/_/g, ' ');
    const finalMethodIcon = methodData?.icon || null;

    const statusMap = isDelivery ? DELIVERY_STATUS_MAP : PAYMENT_STATUS_MAP;
    const statusData = statusMap[status];

    const finalStatusLabel = statusData?.label || status.replace(/_/g, ' ');

    return (
        <section
            className={`${style['info-card']} ${style[`info-card--${variant}`]}`}
            aria-label={cardTitle}
        >
            <div className={style['info-card__header']}>
                <div className={style['info-card__icon-wrapper']} aria-hidden="true">
                    {finalMethodIcon}
                </div>
                <h3 className={style['info-card__title']}>{cardTitle}</h3>
            </div>

            <div className={style['info-card__content']}>
                <div className={style['info-card__method-group']}>
                    <p className={style['info-card__method']}>{finalMethodLabel}</p>

                    <span
                        className={`${style['info-card__status-badge']} ${style[`info-card__status-badge--${status}`]}`}
                        aria-label={`Current status: ${finalStatusLabel}`}
                    >
                        {statusData?.hasIcon && statusData.icon && (
                            <div className={style['info-card__spin-icon']} aria-hidden="true">
                                {statusData.icon}
                            </div>
                        )}
                        {finalStatusLabel}
                    </span>
                </div>

                {subtitle && (
                    <p className={style['info-card__subtitle']}>
                        <span className={style['sr-only']}>Address or details: </span>
                        {subtitle}
                    </p>
                )}
            </div>
        </section>
    );
};