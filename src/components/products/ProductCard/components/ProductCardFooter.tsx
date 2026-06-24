import { FC } from 'react';
import { FaStar } from 'react-icons/fa';
import style from '../productCard.module.scss';
import { formatPrice } from '@/utils';

interface ProductCardFooterProps {
    basePrice: number;
    price: number;
    hasDiscount: boolean;
    rating: number;
    reviewsCount: number;
}

export const ProductCardFooter: FC<ProductCardFooterProps> = ({
    basePrice,
    price,
    hasDiscount,
    rating,
    reviewsCount,
}) => {
    return (
        <div className={style.card__footer}>
            <div className={style.card__price_wrapper}>
                {hasDiscount && (
                    <span className={style.card__oldPrice}>{formatPrice(basePrice)}</span>
                )}
                <span className={style.card__price}>{formatPrice(price)}</span>
            </div>

            <div className={style.card__rating}>
                <FaStar size={12} />
                <span>{rating}</span>
                <span className={style.card__ratingCount}>
                    • {reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}
                </span>
            </div>
        </div>
    );
};