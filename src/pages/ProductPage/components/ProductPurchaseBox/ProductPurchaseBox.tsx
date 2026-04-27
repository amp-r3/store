import style from './product-purchase-box.module.scss';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { changeQuantity } from '@/store/slices/cartSlice';
import { AddToCartButton } from '@/components/common';
import { selectIsMaxReached } from '@/store';

interface ProductPurchaseBoxProps {
    productId: number;
    quantity: number;
    originalPrice: number;
    discountedPriceFormatted: string;
    onAddToCart: (id: number) => void;
    inStock: boolean;
    stock: number;
}

export const ProductPurchaseBox = ({
    productId,
    quantity,
    originalPrice,
    discountedPriceFormatted,
    onAddToCart,
    inStock,
    stock,
}: ProductPurchaseBoxProps) => {
    const dispatch = useAppDispatch();
    const onIncrease = (id: number) => { dispatch(changeQuantity({ id, type: 'inc' })); };
    const onDecrease = (id: number) => { dispatch(changeQuantity({ id, type: 'dec' })); };
    const isMaxReached = useAppSelector(() => selectIsMaxReached(quantity ?? 0, stock ?? 0));
    return (
        <div className={style['purchase-box']}>
            <div className={style['price-block']}>
                <p className={style['price']}>${originalPrice}</p>
                <p className={style['discount-price']}>{discountedPriceFormatted}</p>
            </div>
            <AddToCartButton
                quantity={quantity}
                onAddToCart={() => onAddToCart(productId)}
                onIncrement={() => onIncrease(productId)}
                onDecrement={() => onDecrease(productId)}
                inStock={inStock}
                isMaxReached={isMaxReached}
                size="large"
            />
        </div>
    );
};