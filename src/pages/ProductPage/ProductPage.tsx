// React
import { useEffect, useMemo } from 'react';

// Router
import { useNavigate, useParams, Navigate, useSearchParams } from 'react-router';

// Components
import { ErrorView, Loader } from '@/components/common';
import { ProductBackButton } from './components/ProductBackButton/ProductBackButton';
import { ProductGallery } from './components/ProductGallery/ProductGallery';
import { ProductInfo } from './components/ProductInfo/ProductInfo';
import { ProductPurchaseBox } from './components/ProductPurchaseBox/ProductPurchaseBox';
import { ProductReviews } from './components/ProductReviews/ProductReviews';
import { ProductSpecs } from './components/ProductSpecs/ProductSpecs';

// Utils
import { applyDiscount, getErrorMessage, scrollToTop } from '@/utils';

// Custom Hooks
import { useProduct } from '@/hooks';

// Redux Hooks
import { useAppDispatch, useAppSelector } from '@/hooks/redux';

// Redux Selectors
import { selectCartItems, selectIsMaxReached } from '@/store';
import { addToCart } from '@/store/slices/cartSlice';

// Types
import { Product } from '@/types/products';

// Styles
import style from './productPage.module.scss';
import { ProductImageModal } from './components/ProductImageModal/ProductImageModal';

export const ProductPage = () => {
    const navigate = useNavigate();
    const searchParams = useSearchParams()
    const dispatch = useAppDispatch()
    const { id } = useParams();
    const openedImage = searchParams[0].get('view') === 'true';
    const { product, isLoading, error, isNotFound } = useProduct(id);
    const cartItems = useAppSelector(selectCartItems)
    const onImageClick = (): void => {
        searchParams[1]({ view: 'true' }, { replace: true })
    }

    const onCloseModal = (): void => {
        searchParams[1]({}, { replace: true })
    }

    const selectMaxReached = useMemo(
        () => selectIsMaxReached(product?.id ?? 0, product?.stock ?? 0),
        [product?.id, product?.stock]
    );

    const isMaxReached = useAppSelector(selectMaxReached);

    useEffect(() => {
        scrollToTop();
    }, []);

    const formatPrice = (value: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(value);

    const handleAddToCart = (product: Product) => {
        dispatch(addToCart(product))
    }

    if (isLoading) return <Loader />;
    if (error) return <ErrorView error={getErrorMessage(error)} />;
    if (isNotFound) return <Navigate to="/404" replace />;
    if (!product) return <Loader />;

    const { id: productId, title, price, description, category, brand, images,
        rating, reviews, discountPercentage, stock, sku, dimensions, weight, warrantyInformation, shippingInformation, returnPolicy } = product;

    const inStock = (stock ?? 0) > 0;
    const discountedPrice = applyDiscount({ price, discount: discountPercentage });
    const showPrice = formatPrice(discountedPrice);
    const itemInCart = cartItems.filter(item => item.id === productId);
    const item = itemInCart.find(item => item.id === productId)
    const quantity = item?.quantity

    return (
        <main className={style['product-page']}>
            <ProductImageModal imageSrc={images[0]} imageAlt={title} onClose={onCloseModal} isOpen={openedImage} />
            <div className="container" key={productId}>
                <ProductBackButton onClick={() => navigate(-1)} label='Back to catalog' />

                <div className={style['layout']}>
                    <div className={style['gallery-column']}>
                        <ProductGallery imageUrl={images[0]} title={title} onClick={onImageClick} />
                    </div>

                    <div className={style['details-column']}>
                        <ProductInfo
                            category={category}
                            brand={brand}
                            title={title}
                            stock={stock}
                            rating={rating}
                            reviewsCount={reviews.length}
                            description={description}
                        />
                        <ProductPurchaseBox
                            quantity={quantity}
                            product={product}
                            onAddToCart={handleAddToCart}
                            originalPrice={price}
                            discountedPriceFormatted={showPrice}
                            inStock={inStock}
                            isMaxReached={isMaxReached}
                        />
                    </div>
                </div>

                <ProductSpecs
                    sku={sku}
                    dimensions={dimensions}
                    weight={weight}
                    warranty={warrantyInformation}
                    shipping={shippingInformation}
                    returnPolicy={returnPolicy}
                />

                <ProductReviews reviews={reviews} />
            </div>
        </main>
    );
};