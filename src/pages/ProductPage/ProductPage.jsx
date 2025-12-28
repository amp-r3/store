import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
//Components
import { Loader, ErrorView } from '@/components/ui';
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
import { applyDiscount, scrollToTop } from '@/features/products/utils';
// Custom Hooks
import { useProduct } from '@/hooks';
// Styles
import style from './productPage.module.scss';

const ProductPage = () => {
    const navigate = useNavigate()
    const { id } = useParams();
    const { product, status, isNotFound } = useProduct(id)

    useEffect(() => {
        scrollToTop()
    }, [])

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) =>
            i < Math.round(rating) ? <FaStar key={i} /> : <FaRegStar key={i} />
        );
    };


    if (status === 'loading') {
        return <Loader />;
    }

    if (status === 'failed') {
        return <ErrorView />;
    }

    if (isNotFound) {
        return navigate('/404')
    }

    if (status === 'succeeded' && product) {
        const { id, title, price, description, category, images, rating, reviews, discountPercentage, stock } = product;
        const discountedPrice = applyDiscount(discountPercentage, price);

        return (
            <main className={style['product-page']}>
                <div className={style['product-page__container']} key={id}>
                    <div className={style['product-page__back-wrapper']}>
                        <button onClick={()=> navigate(-1)} className={style['product-page__back-link']}>
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
                                <p className={style['product-page__discount-price']}>${discountedPrice}</p>
                                <button className={style['product-page__add-to-cart-btn']}>
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

export default ProductPage;