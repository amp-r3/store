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
        <header className={style['info-container']}>
            <div className={style['meta']}>
                <span className={style['category']}>{category}</span>
                {brand && (
                    <>
                        <span className={style['meta-divider']} aria-hidden="true" />
                        <span className={style['brand']}>{brand}</span>
                    </>
                )}
            </div>

            <h1 className={style['title']}>{title}</h1>

            <div
                className={style['rating']}
                aria-label={`Rating ${rating} out of 5, based on ${reviewsCount} reviews`}
            >
                <span className={style['rating-value']} aria-hidden="true">
                    {rating}
                </span>
                <FaStar className={style['rating-star']} aria-hidden="true" />
                <a
                    href="#reviews"
                    className={style['rating-count']}
                    aria-label={`Look all ${reviewsCount} reviews`}
                >
                    {reviewsCount} reviews
                </a>
            </div>
        </header>
    );
};