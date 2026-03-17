import { FC } from 'react';
import { Product } from '@/types/products';
import { FaCartShopping } from 'react-icons/fa6';
import style from '../productCard.module.scss';

interface ProductCardFooterProps {
    product: Product;
    price: number;
    discountedPrice: number;
    hasDiscount: boolean;
    handleAddToCart: (product: Product) => void;
    inStock: boolean;
    isMaxReached: boolean;
    haptic: ()=> void
}

const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(value);
};

export const ProductCardFooter: FC<ProductCardFooterProps> = ({
    product,
    price,
    discountedPrice,
    hasDiscount,
    handleAddToCart,
    inStock,
    isMaxReached,
    haptic
}) => {
    console.log("footer card rerender");
    return (
        <div className={style.card__footer}>
            <div className={style.card__price_wrapper}>
                {hasDiscount && (
                    <span className={style.card__oldPrice}>{formatPrice(price)}</span>
                )}
                <span className={style.card__price}>{formatPrice(discountedPrice)}</span>
            </div>

            <button
                onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product);
                    haptic()
                }}
                className={style.card__button}
                disabled={!inStock || isMaxReached}
            >
                <FaCartShopping size={18} />
                <span>Add to Cart</span>
            </button>
        </div>
    );
};