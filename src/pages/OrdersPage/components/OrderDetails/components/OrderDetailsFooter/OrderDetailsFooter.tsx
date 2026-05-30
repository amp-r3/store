import { FC } from 'react';
import { FiRefreshCcw } from 'react-icons/fi';
import { LuMessageSquareQuote } from 'react-icons/lu';
import { formatPrice } from '@/utils';
import style from './order-details-footer.module.scss';

interface OrderDetailsFooterProps {
    goodsTotal: number;
    deliveryCost: number;
    paymentFee: number;
    totalAmount: number;
    variant: 'drawer' | 'card';
}

export const OrderDetailsFooter: FC<OrderDetailsFooterProps> = ({
    goodsTotal,
    deliveryCost,
    paymentFee,
    totalAmount,
    variant,
}) => {
    return (
        <footer className={`${style['footer']} ${style[`footer--${variant}`]}`}>
            <div className={style['footer__summary']}>
                <div className={style['footer__summary-row']}>
                    <span className={style['footer__summary-label']}>Cost of goods</span>
                    <span className={style['footer__summary-value']}>{formatPrice(goodsTotal)}</span>
                </div>

                <div className={style['footer__summary-row']}>
                    <span className={style['footer__summary-label']}>Delivery</span>
                    <span className={style['footer__summary-value']}>{formatPrice(deliveryCost)}</span>
                </div>

                {paymentFee > 0 && (
                    <div className={style['footer__summary-row']}>
                        <span className={style['footer__summary-label']}>Payment commission</span>
                        <span className={style['footer__summary-value']}>{formatPrice(paymentFee)}</span>
                    </div>
                )}

                <div className={style['footer__summary-divider']} />

                <div className={`${style['footer__summary-row']} ${style['footer__summary-row--total']}`}>
                    <span className={style['footer__total-label']}>Total</span>
                    <div className={style['footer__total-price-wrapper']}>
                        <span className={style['footer__total-value']}>{formatPrice(totalAmount)}</span>
                        <span className={style['footer__total-subtext']}>VAT included</span>
                    </div>
                </div>
            </div>

            <div className={style['footer__btn-container']}>
                <button className={style['footer__repeat-btn']}>
                    <FiRefreshCcw />
                    Repeat order
                </button>
                <button className={style['footer__support-btn']}>
                    <LuMessageSquareQuote />
                    Support
                </button>
            </div>
        </footer>
    );
};