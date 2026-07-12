import { FC } from 'react';

import style from './product-card.module.scss';
import { ProductSize } from '@/entities/product/model/types';
import { ProductStockBadge } from './ProductStockBadge';

interface ProductCardImageProps {
    title: string;
    thumbnail: string;
    category: string;
    discountPercentage: number;
    sizes: ProductSize[];
    isSizesLoading: boolean;
    priority?: boolean;
    actionSlot?: React.ReactNode;
}

export const ProductCardImage: FC<ProductCardImageProps> = ({
    title,
    thumbnail,
    category,
    discountPercentage,
    sizes,
    isSizesLoading,
    priority = false,
    actionSlot
}) => {


    return (
        <div className={style.card__imageWrapper}>
            <img
                src={thumbnail}
                alt={title}
                className={style.card__image}
                loading={priority ? 'eager' : 'lazy'}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : 'low'}
                width="241"
                height="241"
            />
            <div className={style['card__promo-block']}>
                <span className={style.card__category}>{category}</span>
                {discountPercentage > 0 && (
                    <span className={style.card__discount}>
                        -{Math.round(discountPercentage)}%
                    </span>
                )}
            </div>

            <ProductStockBadge
                sizes={sizes}
                isLoading={isSizesLoading}
            />

            {actionSlot}
        </div>
    );
};