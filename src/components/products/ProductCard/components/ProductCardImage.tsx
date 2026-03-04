import { Link } from 'react-router-dom';
import { FC } from 'react';
import style from '../productCard.module.scss';

interface ProductCardImageProps {
    title: string;
    thumbnail: string;
    category: string;
}

export const ProductCardImage: FC<ProductCardImageProps> = ({ title, thumbnail, category }) => {
    return (
        <div className={style.card__imageWrapper}>
            <img src={thumbnail} alt={title} className={style.card__image} loading="lazy" decoding="async" />
            <span className={style.card__category}>{category}</span>
        </div>
    );
};