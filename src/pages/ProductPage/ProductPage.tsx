import { useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router';
//Components
import { ErrorView, Loader } from '@/components/common';
// Icons
import {
    FaStar,
    FaCartShopping,
    FaChevronLeft,
    FaComments,
    FaCalendarDays,
    FaRegStar
} from 'react-icons/fa6';
// Utils
import { applyDiscount, getErrorMessage, scrollToTop } from '@/utils';
// Custom Hooks
import { useProduct } from '@/hooks';
// Redux Hooks
import { useAppDispatch } from '@/hooks/redux';
// Redux Functions
import { addToCart } from '@/store/slices/cartSlice';
// Styles
import style from './productPage.module.scss';

export const ProductPage = () => {
    const navigate = useNavigate()
    const { id } = useParams();
    const { product, isLoading, error, isNotFound } = useProduct(id)
    const dispatch = useAppDispatch()

    useEffect(() => {
        scrollToTop()
    }, [])

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? <FaStar key={i} /> : <FaRegStar key={i} />
        );
    };

    const handleAddToCart = () => {
        if (product) {
            dispatch(addToCart(product));
        }
    }


    if (isLoading) {
        return <Loader />
    }

    if (error) {
        const errorMessage = getErrorMessage(error);
        return <ErrorView error={errorMessage} />
    }

    if (isNotFound) {
        return <Navigate to="/404" replace />
    }
    const formatPrice = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);
    };

    if (product) {
        const { id, title, price, description, category, images, rating, reviews, discountPercentage, stock } = product;
        const discountedPrice = applyDiscount(discountPercentage, price);

        const showPrice = formatPrice(discountedPrice)

        return (
            <main className={style['product-page']}>
                <div className='container' key={id}>
                    <div className={style['product-page__back-wrapper']}>
                        <button onClick={() => navigate(-1)} className={style['product-page__back-link']}>
                            <FaChevronLeft size={14} />
                            <span>Back to catalog</span>
                        </button>
                    </div>

                    <div className={style['product-page__layout']}>
                        <div className={style['product-page__image-column']}>
                            <div className={style['product-page__image-wrapper']}>
                                <img src={images[0]} alt={title} className={style['product-page__image']} />
                            </div>
                        </div>

                        <div className={style['product-page__details-column']}>
                            <span className={style['product-page__category']}>{category}</span>
                            <h1 className={style['product-page__title']}>{title}</h1>

                            <span className={style['product-page__stock']}>{stock} in stock</span>

                            <div className={style['product-page__rating']}>
                                <span className={style['product-page__rating-value']}>{rating}</span>
                                <FaStar />
                                <a href="#reviews" className={style['product-page__rating-count']}>
                                    ({reviews.length} reviews)
                                </a>
                            </div>

                            <p className={style['product-page__description']}>{description}</p>

                            <div className={style['product-page__purchase-box']}>
                                <p className={style['product-page__price']}>${price}</p>
                                <p className={style['product-page__discount-price']}>{showPrice}</p>
                                <button onClick={handleAddToCart} className={style['product-page__add-to-cart-btn']}>
                                    <FaCartShopping size={20} />
                                    <span>Add to Cart</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {reviews && reviews.length > 0 && (
                        <div id="reviews" className={style['product-page__reviews']}>
                            <h2 className={style['product-page__reviews-title']}>
                                <FaComments />
                                <span>Reviews</span>
                            </h2>
                            <div className={style['product-page__reviews-list']}>
                                {reviews.map((review, index) => (
                                    <div className={style['product-page__review-card']} key={index}>
                                        <div className={style['product-page__review-header']}>
                                            <span className={style['product-page__review-author']}>{review.reviewerName}</span>
                                            <div className={style['product-page__review-rating']}>
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <div className={style['product-page__review-meta']}>
                                            <FaCalendarDays />
                                            <span>{new Date(review.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className={style['product-page__review-comment']}>{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        );
    }

    return <Loader />;
};