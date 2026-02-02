// React
import { FC } from 'react';
// Icons
import { IoArrowForward, IoGiftOutline } from 'react-icons/io5';
// Styles
import style from './cart-footer.module.scss'
import { formatPrice } from '@/utils';

interface CartFooterProps {
    subtotal: number;
    total: number;
    discountAmount: number;
    discountPercent: number;
    shippingProgress: number;
    remainingForFreeShipping: number;
    onCheckout?: () => void;
}

export const CartFooter: FC<CartFooterProps> = ({
    subtotal,
    total,
    discountAmount,
    discountPercent,
    shippingProgress,
    remainingForFreeShipping,
    onCheckout,
}) => {
    const safeProgress = Math.min(100, Math.max(0, shippingProgress));
    return (
        <footer className={style.footer}>
            {/* Shipping Progress */}
            <div className={style.footer__shipping}>
                <div className={style.footer__shippingInfo}>
                    {remainingForFreeShipping > 0 ? (
                        <span>
                            Add <b>{formatPrice(remainingForFreeShipping)}</b> for free shipping
                        </span>
                    ) : (
                        <span className={style.footer__shippingSuccess}>
                            <IoGiftOutline /> Free shipping unlocked!
                        </span>
                    )}
                </div>
                <div
                    className={style.footer__progressBar}
                    role="progressbar"
                    aria-valuenow={shippingProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Shipping for free delivery"
                >
                    <div
                        className={style.footer__progressFill}
                        style={{ width: `${safeProgress}%` }}
                    />
                </div>
            </div>

            {/* Price Details */}
            <div className={style.footer__summary}>
                <div className={style.footer__row}>
                    <span className={style.footer__label}>Subtotal</span>
                    <span className={style.footer__value}>{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                    <div className={`${style.footer__row} ${style['footer__row--discount']}`}>
                        <span className={style.footer__label}>You Save ({discountPercent}%)</span>
                        <span className={style.footer__value}>-{formatPrice(discountAmount)}</span>
                    </div>
                )}

                <div className={style.footer__divider} />

                <div className={`${style.footer__row} ${style['footer__row--total']}`}>
                    <span className={style.footer__label}>Total</span>
                    <span className={style.footer__total}>{formatPrice(total)}</span>
                </div>

                <p className={style.footer__note}>Tax included. Shipping calculated at checkout.</p>
            </div>

            <button className={style.footer__checkoutBtn} onClick={onCheckout}>
                Proceed to Checkout <IoArrowForward size={20} />
            </button>
        </footer>
    );
};