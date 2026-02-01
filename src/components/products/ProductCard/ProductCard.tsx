import style from './productCard.module.scss'
import { FaStar } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { Product } from '@/types/products';
import { FC } from 'react';
import { applyDiscount } from '@/utils';

interface ProductCardProps {
    product: Product;
    handleAddToCart: (product: Product) => void;
}

export const ProductCard: FC<ProductCardProps> = ({ product, handleAddToCart }) => {
    const { id, title, price, category, thumbnail, rating, reviews, discountPercentage, stock } = product;

    const discountedPrice = applyDiscount({ price: price, discount: discountPercentage });
    const hasDiscount = discountPercentage > 0;

    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    return (
        <div className={style.card}>
            <Link
                to={`/product/${id}`}
                className={style.card__imageWrapper}
                aria-label={`View details for ${title}`}
            >
                <img src={thumbnail} alt={title} className={style.card__image} loading="lazy" decoding="async" />
                <span className={style.card__category}>{category}</span>
            </Link>

            <div className={style.card__body}>
                <Link
                    to={`/product/${id}`}
                    className={style.card__title}
                >
                    {title}
                </Link>

                <span className={style.card__stock}>{stock} in stock</span>

                <div className={style.card__rating}>
                    <span>{rating}</span>
                    <FaStar size={10} />
                    <span className={style.card__ratingCount}>({reviews.length} reviews)</span>
                </div>
            </div>

            <div className={style.card__footer}>
                <div className={style.card__price_wrapper}>
                    {hasDiscount && (
                        <span className={style.card__oldPrice}>{formatPrice(price)}</span>
                    )}
                    <span className={style.card__price}>{formatPrice(discountedPrice)}</span>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                    }}
                    className={style.card__button}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};