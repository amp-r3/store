import { FaStar } from 'react-icons/fa6';
import style from './product-info.module.scss';

interface ProductInfoProps {
    category: string;
    brand: string;
    title: string;
    rating: number;
    reviewsCount: number;
}

export const ProductInfo = ({
    category,
    brand,
    title,
    rating,
    reviewsCount,
}: ProductInfoProps) => {
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
        </div>
    );
};