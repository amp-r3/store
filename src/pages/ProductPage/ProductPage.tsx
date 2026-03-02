import { useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router';

// Components
import { ErrorView, Loader } from '@/components/common';

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
import { ProductBackButton } from './components/ProductBackButton/ProductBackButton';
import { ProductGallery } from './components/ProductGallery/ProductGallery';
import { ProductInfo } from './components/ProductInfo/ProductInfo';
import { ProductPurchaseBox } from './components/ProductPurchaseBox/ProductPurchaseBox';
import { ProductReviews } from './components/ProductReviews/ProductReviews';

export const ProductPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { product, isLoading, error, isNotFound } = useProduct(id);
    const dispatch = useAppDispatch();

    useEffect(() => {
        scrollToTop();
    }, []);

    const handleAddToCart = () => {
        if (product) {
            dispatch(addToCart(product));
        }
    };

    const formatPrice = (value: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);

    if (isLoading) return <Loader />;
    if (error) return <ErrorView error={getErrorMessage(error)} />;
    if (isNotFound) return <Navigate to="/404" replace />;
    if (!product) return <Loader />;

    const { id: productId, title, price, description, category, images,
            rating, reviews, discountPercentage, stock } = product;

    const discountedPrice = applyDiscount({ price, discount: discountPercentage });
    const showPrice = formatPrice(discountedPrice);

    return (
        <main className={style['product-page']}>
            <div className="container" key={productId}>
                <ProductBackButton onClick={() => navigate(-1)} />

                <div className={style['layout']}>
                    <div className={style['gallery-column']}>
                        <ProductGallery imageUrl={images[0]} title={title} />
                    </div>

                    <div className={style['details-column']}>
                        <ProductInfo
                            category={category}
                            title={title}
                            stock={stock}
                            rating={rating}
                            reviewsCount={reviews.length}
                            description={description}
                        />
                        <ProductPurchaseBox
                            originalPrice={price}
                            discountedPriceFormatted={showPrice}
                            onAddToCart={handleAddToCart}
                        />
                    </div>
                </div>

                <ProductReviews reviews={reviews} />
            </div>
        </main>
    );
};