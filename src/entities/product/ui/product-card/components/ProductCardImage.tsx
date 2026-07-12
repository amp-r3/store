import { FC } from 'react';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import style from '../productCard.module.scss';
import { ProductSize } from '@/entities/product/model/types';
import { ProductStockBadge } from './ProductStockBadge';

interface ProductCardImageProps {
    title: string;
    thumbnail: string;
    category: string;
    discountPercentage: number;
    handleAddToWishlist(): void;
    isFavorite: boolean;
    sizes: ProductSize[];
    isSizesLoading: boolean;
    priority?: boolean
}

export const ProductCardImage: FC<ProductCardImageProps> = ({
    title,
    thumbnail,
    category,
    discountPercentage,
    handleAddToWishlist,
    isFavorite,
    sizes,
    isSizesLoading,
    priority = false

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

            <button className={style['card__add-to-favorites']} onClick={handleAddToWishlist}>
                {
                    isFavorite ?
                        <FaHeart className={style['card__icon']} /> :
                        <FaRegHeart className={style['card__icon']} />
                }
            </button>
        </div>
    );
};