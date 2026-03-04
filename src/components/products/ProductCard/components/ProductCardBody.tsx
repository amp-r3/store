import { FC } from 'react';
import { FaStar } from 'react-icons/fa';
import { Review } from '@/types/products';
import style from '../productCard.module.scss';

interface ProductCardBodyProps {
    title: string;
    stock: number;
    rating: number;
    reviews: Review[];
}

export const ProductCardBody: FC<ProductCardBodyProps> = ({ title, stock, rating, reviews }) => {
    const isLowStock = stock > 0 && stock < 5;
    const isOutOfStock = stock === 0;

    let stockClass = style.card__stock;
    if (isLowStock) stockClass += ` ${style['card__stock--low']}`;
    if (isOutOfStock) stockClass += ` ${style['card__stock--out']}`;

    const stockText = isOutOfStock ? 'Out of stock' : isLowStock ? `Only ${stock} left!` : `${stock} in stock`;

    return (
        <div className={style.card__body}>
            <span className={style.card__title}>{title}</span>

            <div className={style.card__meta}>
                <div className={style.card__rating}>
                    <FaStar size={10} />
                    <span>{rating}</span>
                    <span className={style.card__ratingCount}>({reviews.length})</span>
                </div>

                <span className={stockClass}>{stockText}</span>
            </div>
        </div>
    );
};