import { FC } from 'react';
import style from '../productCard.module.scss'
import { ProductSize } from '@/types/products';

interface ProductStockBadgeProps {
    sizes: ProductSize[];
    isLoading: boolean;
}
export const ProductStockBadge: FC<ProductStockBadgeProps> = ({ sizes, isLoading }) => {
    const allStock = sizes?.map(size => size?.stock ?? 0) ?? [];
    const totalStock = allStock.reduce((sum, s) => sum + s, 0);

    const isOutOfStock = totalStock === 0;
    const isLowStock = !isOutOfStock && totalStock <= 10;

    if (isLoading) {
        return null;
    }

    if (isOutOfStock) {
        return (
            <span className={`${style['card__stock-badge']} ${style['card__stock-badge--out']}`}>
                Out of Stock
            </span>
        );
    }

    if (isLowStock) {
        return (
            <span className={`${style['card__stock-badge']} ${style['card__stock-badge--low']}`}>
                There are a few left
            </span>
        );
    }

    return null;
}