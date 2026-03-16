import { FC } from 'react';
import style from '../productCard.module.scss';

interface ProductCardImageProps {
    title: string;
    thumbnail: string;
    category: string;
    discountPercentage: number;
    priority?: boolean
}

const getOptimizedImageUrl = (originalUrl: string, width: number = 300) => {
    return `https://wsrv.nl/?url=${encodeURIComponent(originalUrl)}&w=${width}&fit=contain&we`;
};

export const ProductCardImage: FC<ProductCardImageProps> = ({ 
    title, 
    thumbnail, 
    category, 
    discountPercentage,
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
            <span className={style.card__category}>{category}</span>
            {discountPercentage > 0 && (
                <span className={style.card__discount}>
                    -{Math.round(discountPercentage)}%
                </span>
            )}
        </div>
    );
};