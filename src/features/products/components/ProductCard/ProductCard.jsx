import style from './productCard.module.scss'
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { applyDiscount } from '@/features/products/utils'

const ProductCard = ({ id, title, price, category, thumbnail, rating, reviews, discountPercentage, stock }) => {

    const discountedPrice = applyDiscount(discountPercentage, price);
    return (
        <Link to={`/product/${id}`} key={id} className={style.card}>
            <div className={style.card__imageWrapper}>
                <img src={thumbnail} alt={title} className={style.card__image} loading="lazy" decoding="async" />
                <span className={style.card__category}>{category}</span>
            </div>

            <div className={style.card__body}>
                <h3 className={style.card__title}>{title}</h3>

                <span className={style.card__stock}>{stock} in stock</span>

                <div className={style.card__rating}>
                    <span>{rating}</span>
                    <FaStar />
                    <span className={style.card__ratingCount}>({reviews.length} reviews)</span>
                </div>
            </div>

            <div className={style.card__footer}>
                <div className={style.card__price_wrapper}>
                    <p className={style.card__price}>${price}</p>
                    <p className={style.card__discountPrice}>${discountedPrice}</p>
                </div>
                <button className={style.card__button}>Add to Cart</button>
            </div>
        </Link>
    );
};

export default ProductCard;