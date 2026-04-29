import { FC } from 'react';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import style from '../productCard.module.scss';

interface ProductCardImageProps {
    title: string;
    thumbnail: string;
    category: string;
    discountPercentage: number;
    handleAddToWishlist(): void;
    isFavorite: boolean;
    priority?: boolean
}

const getOptimizedImageUrl = (originalUrl: string) => {
    return `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}`;
};

export const ProductCardImage: FC<ProductCardImageProps> = ({
    title,
    thumbnail,
    category,
    discountPercentage,
    handleAddToWishlist,
    isFavorite,
    priority = false

}) => {
    const imageUrl = getOptimizedImageUrl(thumbnail);
    return (
        <div className={style.card__imageWrapper}>
            <img
                src={imageUrl}
                alt={title}
                className={style.card__image}
                loading={priority ? 'eager' : 'lazy'}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : 'low'}
                width="400"
                height="300"
            />
            <div className={style['card__promo-block']}>
                <span className={style.card__category}>{category}</span>
                {discountPercentage > 0 && (
                    <span className={style.card__discount}>
                        -{Math.round(discountPercentage)}%
                    </span>
                )}
            </div>
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