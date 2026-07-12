import { FC, useState } from 'react';
import { FiRefreshCcw } from 'react-icons/fi';
import { LuMessageSquareQuote, LuCopyCheck } from 'react-icons/lu';
import style from './order-details-footer.module.scss';
import { addToCheckout, clearCheckout } from '@/features/checkout-process';
import { CartProduct } from '@/entities/cart';
import { useNavigate } from 'react-router';
import { Modal } from '@/shared/ui';
import { formatPrice } from "@/shared/lib";
import { useAppDispatch } from "@/shared/model";

interface OrderDetailsFooterProps {
    totalAmount: number;
    variant: 'drawer' | 'card';
    orderCartProduct: CartProduct[]
}

export const OrderDetailsFooter: FC<OrderDetailsFooterProps> = ({
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