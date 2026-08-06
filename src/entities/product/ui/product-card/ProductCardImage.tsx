import { FC } from 'react';
import Image from 'next/image';

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
            <Image
                src={thumbnail}
                alt={title}
                fill
                sizes="(max-width: 500px) 50vw, (max-width: 768px) 33vw, 25vw"
                className={style.card__image}
                priority={priority}
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