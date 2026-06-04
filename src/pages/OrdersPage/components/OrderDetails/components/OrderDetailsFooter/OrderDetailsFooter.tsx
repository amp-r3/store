import { FC, useState } from 'react';
import { FiRefreshCcw } from 'react-icons/fi';
import { LuMessageSquareQuote, LuCopyCheck } from 'react-icons/lu';
import { formatPrice } from '@/utils';
import style from './order-details-footer.module.scss';
import { useAppDispatch } from '@/hooks';
import { addToCheckout, clearCheckout } from '@/store/slices/checkoutSlice';
import { CartProduct } from '@/store/selectors/cartSelectors';
import { useNavigate } from 'react-router';
import { Modal } from '@/components/common';

interface OrderDetailsFooterProps {
    goodsTotal: number;
    deliveryCost: number;
    paymentFee: number;
    totalAmount: number;
    variant: 'drawer' | 'card';
    orderCartProduct: CartProduct[]
}

export const OrderDetailsFooter: FC<OrderDetailsFooterProps> = ({
    goodsTotal,
    deliveryCost,
    paymentFee,
    totalAmount,
    orderCartProduct,
    variant,
}) => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [modal, setModal] = useState(false);
    const onOpenChange = () => {
        setModal((prev) => !prev)
    }
    const handleRepeat = () => {
        dispatch(clearCheckout())
        dispatch(addToCheckout(orderCartProduct))
        navigate('/checkout')
    }
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
                <button className={style['footer__repeat-btn']} onClick={() => { setModal(true) }}>
                    <FiRefreshCcw />
                    Repeat order
                </button>
                <button className={style['footer__support-btn']}>
                    <LuMessageSquareQuote />
                    Support
                </button>
            </div>
            <Modal
                isOpen={modal}
                onOpenChange={onOpenChange}
                title="Repeat this order?"
                description="You will go straight to payment for these items. Your current cart will not change."
                icon={<LuCopyCheck size={48} />}
                actionLabel="Buy Again"
                onAction={handleRepeat}
                actionVariant="default"
            />
        </footer>
    );
};