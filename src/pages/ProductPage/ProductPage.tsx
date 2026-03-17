import { useEffect, useMemo } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router';

// Components
import { ErrorView, Loader } from '@/components/common';
import { ProductBackButton } from './components/ProductBackButton/ProductBackButton';
import { ProductGallery } from './components/ProductGallery/ProductGallery';
import { ProductInfo } from './components/ProductInfo/ProductInfo';
import { ProductPurchaseBox } from './components/ProductPurchaseBox/ProductPurchaseBox';
import { ProductReviews } from './components/ProductReviews/ProductReviews';

// Utils
import { applyDiscount, getErrorMessage, scrollToTop } from '@/utils';

// Custom Hooks
import { useHaptics, useProduct } from '@/hooks';

// Redux Hooks
import { useAppDispatch, useAppSelector } from '@/hooks/redux';

// Redux Functions
import { addToCart } from '@/store/slices/cartSlice';

// Redux Selectors
import { selectIsMaxReached } from '@/store';

// Styles
import style from './productPage.module.scss';

export const ProductPage = () => {
    const { light } = useHaptics();
    const navigate = useNavigate();
    const { id } = useParams();
    const { product, isLoading, error, isNotFound } = useProduct(id);
    const dispatch = useAppDispatch();

    const selectMaxReached = useMemo(
        () => selectIsMaxReached(product?.id ?? 0, product?.stock ?? 0),
        [product?.id, product?.stock]
    );

    const isMaxReached = useAppSelector(selectMaxReached);

    useEffect(() => {
        scrollToTop();
    }, []);

    const handleAddToCart = () => {
        if (product) {
            light();
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
        
    const inStock = (stock ?? 0) > 0;
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
                            inStock={inStock}
                        />
                        <ProductPurchaseBox
                            originalPrice={price}
                            discountedPriceFormatted={showPrice}
                            onAddToCart={handleAddToCart}
                            inStock={inStock}
                            isMaxReached={isMaxReached}
                        />
                    </div>
                </div>

                <ProductReviews reviews={reviews} />
            </div>
        </main>
    );
};