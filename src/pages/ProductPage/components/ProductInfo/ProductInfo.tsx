import { FaStar } from 'react-icons/fa6';
import style from './product-info.module.scss';

interface ProductInfoProps {
    category: string;
    title: string;
    stock: number;
    rating: number;
    reviewsCount: number;
    description: string;
}

export const ProductInfo = ({
    category,
    title,
    stock,
    rating,
    reviewsCount,
    description,
}: ProductInfoProps) => {
    return (
        <div className={style['info-container']}>
            <span className={style['category']}>{category}</span>
            <h1 className={style['title']}>{title}</h1>

            <div className={style['rating']}>
                <span className={style['rating-value']}>{rating}</span>
                <FaStar className={style['rating-star']} />
                <a href="#reviews" className={style['rating-count']}>
                    {reviewsCount} reviews
                </a>
            </div>

            <span className={style['stock']}>{stock} in stock</span>

            <p className={style['description']}>{description}</p>
        </div>
    );
};