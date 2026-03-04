import { Link } from 'react-router-dom';
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
    return (
        <div className={style.card__body}>
            <span className={style.card__title}>{title}</span>

            <div className={style.card__meta}>
                <div className={style.card__rating}>
                    <FaStar size={10} />
                    <span>{rating}</span>
                    <span className={style.card__ratingCount}>({reviews.length})</span>
                </div>

                <span className={style.card__stock}>{stock} in stock</span>
            </div>
        </div>
    );
};