import { FaCartShopping } from 'react-icons/fa6';
import style from './product-purchase-box.module.scss';
import { useAppDispatch } from '@/hooks';
import { changeQuantity } from '@/store/slices/cartSlice';
import { AddToCartButton } from '@/components/common';
import { Product } from '@/types/products';

interface ProductPurchaseBoxProps {
    product: Product;
    quantity: number;
    originalPrice: number;
    discountedPriceFormatted: string;
    onAddToCart: (product: Product) => void;
    inStock: boolean;
    isMaxReached: boolean;
}

export const ProductPurchaseBox = ({
    product,
    quantity,
    originalPrice,
    discountedPriceFormatted,
    onAddToCart,
    inStock,
    isMaxReached
}: ProductPurchaseBoxProps) => {
    const dispatch = useAppDispatch();
    const onIncrease  = (id: number) => { dispatch(changeQuantity({ id, type: 'inc' })); };
    const onDecrease  = (id: number) => { dispatch(changeQuantity({ id, type: 'dec' })); };
    return (
        <div className={style['purchase-box']}>
            <div className={style['price-block']}>
                <p className={style['price']}>${originalPrice}</p>
                <p className={style['discount-price']}>{discountedPriceFormatted}</p>
            </div>
            <AddToCartButton
                quantity={quantity}
                onAddToCart={() => onAddToCart(product)}
                onIncrement={() => onIncrease(product.id)}
                onDecrement={() => onDecrease(product.id)}
                inStock={inStock}
                isMaxReached={isMaxReached}
                size="large"
            />
        </div>
    );
};