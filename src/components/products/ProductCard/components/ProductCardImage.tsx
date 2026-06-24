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
    stock: number;
    priority?: boolean
}

export const ProductCardImage: FC<ProductCardImageProps> = ({
    title,
    thumbnail,
    category,
    discountPercentage,
    handleAddToWishlist,
    isFavorite,
    stock,
    priority = false

}) => {
    const isLowStock = stock > 0 && stock <= 10;
    const isOutOfStock = stock === 0;

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

            {isLowStock && (
                <span className={`${style['card__stock-badge']} ${style['card__stock-badge--low']}`}>
                    Only {stock} Left
                </span>
            )}
            {isOutOfStock && (
                <span className={`${style['card__stock-badge']} ${style['card__stock-badge--out']}`}>
                    Out of Stock
                </span>
            )}

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