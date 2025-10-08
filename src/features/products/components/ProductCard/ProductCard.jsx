import style from './productCard.module.scss'
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ProductCard = ({ id, title, price, category, thumbnail, rating, reviews }) => {

    return (
        <Link to={`/product/${id}`} key={id} className={style.card}>
            <div className={style.card__imageWrapper}>
                <img src={thumbnail} alt={title} className={style.card__image} />
                <span className={style.card__category}>{category}</span>
            </div>

            <div className={style.card__body}>
                <h3 className={style.card__title}>{title}</h3>

                <div className={style.card__rating}>
                    <span>{rating}</span>
                    <FaStar />
                    <span className={style.card__ratingCount}>({reviews.length} reviews)</span>
                </div>
            </div>

            <div className={style.card__footer}>
                <p className={style.card__price}>${price}</p>
                <button className={style.card__button}>Add to Cart</button>
            </div>
        </Link>
    );
};

export default ProductCard;