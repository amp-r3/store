import { FaCartShopping } from 'react-icons/fa6';
import style from './product-purchase-box.module.scss';

interface ProductPurchaseBoxProps {
    originalPrice: number;
    discountedPriceFormatted: string;
    onAddToCart: () => void;
    inStock: boolean;
    isMaxValue: boolean;
}

export const ProductPurchaseBox = ({
    originalPrice,
    discountedPriceFormatted,
    onAddToCart,
    inStock,
    isMaxValue
}: ProductPurchaseBoxProps) => {
    return (
        <div className={style['purchase-box']}>
            <div className={style['price-block']}>
                <p className={style['price']}>${originalPrice}</p>
                <p className={style['discount-price']}>{discountedPriceFormatted}</p>
            </div>
            <button onClick={onAddToCart} className={style['add-to-cart-btn']} disabled={!inStock || isMaxValue}>
                <FaCartShopping size={18} />
                <span>Add to Cart</span>
            </button>
        </div>
    );
};