import { FaStar } from 'react-icons/fa6';
import style from './product-info.module.scss';

interface ProductInfoProps {
    category: string;
    brand: string;
    title: string;
    stock: number;
    rating: number;
    reviewsCount: number;
    description: string;
}

export const ProductInfo = ({
    category,
    brand,
    title,
    stock = 0,
    rating,
    reviewsCount,
    description,
}: ProductInfoProps) => {
    const isLowStock = stock > 0 && stock < 5;
    const isOutOfStock = stock === 0;

    let stockClass = style['stock'];
    if (isLowStock) stockClass += ` ${style['stock--low']}`;
    if (isOutOfStock) stockClass += ` ${style['stock--out']}`;
    const stockText = isOutOfStock ? 'Out of stock' : isLowStock ? `Only ${stock} left!` : `${stock} in stock`;

    return (
        <div className={style['info-container']}>
            <div className={style['meta']}>
                <span className={style['category']}>{category}</span>
                {
                    brand &&
                    <>
                        <span className={style['meta-divider']}>·</span>
                        <span className={style['brand']}>{brand}</span>
                    </>
                }
            </div>
            <h1 className={style['title']}>{title}</h1>

            <div className={style['rating']}>
                <span className={style['rating-value']}>{rating}</span>
                <FaStar className={style['rating-star']} />
                <a href="#reviews" className={style['rating-count']}>
                    {reviewsCount} reviews
                </a>
            </div>

            <span className={stockClass} data-stock={isOutOfStock ? 'empty' : isLowStock ? 'low' : 'in stock'}>{stockText}</span>

            <p className={style['description']}>{description}</p>
        </div>
    );
};