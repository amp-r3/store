import { FC } from 'react';
import style from '../productCard.module.scss';

interface ProductCardImageProps {
    title: string;
    thumbnail: string;
    category: string;
    discountPercentage: number;
}

export const ProductCardImage: FC<ProductCardImageProps> = ({ title, thumbnail, category, discountPercentage }) => {
    return (
        <div className={style.card__imageWrapper}>
            <img src={thumbnail} alt={title} className={style.card__image} loading="lazy" decoding="async" />
            <span className={style.card__category}>{category}</span>
            {discountPercentage > 0 && (
                <span className={style.card__discount}>-{Math.round(discountPercentage)}%</span>
            )}
        </div>
    );
};