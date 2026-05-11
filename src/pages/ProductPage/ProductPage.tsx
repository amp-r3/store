// React
import { useEffect } from 'react';

// Router
import { useNavigate, useParams, Navigate, useSearchParams } from 'react-router';

// Components
import { ErrorView } from '@/components/common';
import { ProductHeader } from './components/ProductHeader/ProductHeader';
import { ProductGallery } from './components/ProductGallery/ProductGallery';
import { ProductInfo } from './components/ProductInfo/ProductInfo';
import { ProductPurchaseBox } from './components/ProductPurchaseBox/ProductPurchaseBox';
import { ProductReviews } from './components/ProductReviews/ProductReviews';
import { ProductSpecs } from './components/ProductSpecs/ProductSpecs';
import { ProductImageModal } from './components/ProductImageModal/ProductImageModal';
import { ProductPageSkeleton } from './ProductPageSkeleton';

// Utils
import { applyDiscount, formatPrice, getErrorMessage, scrollToTop } from '@/utils';

// Custom Hooks
import { useCartActions, useCartDetails, useProduct, useWishlistActions, useWishlistDetails } from '@/hooks';


// Styles
import style from './productPage.module.scss';

export const ProductPage = () => {
    const navigate = useNavigate();
    const searchParams = useSearchParams()
    const { id } = useParams();
    const { onIncrease, onDecrease } = useCartActions()
    const { onWishlist } = useWishlistActions()
    const { wishlistItems } = useWishlistDetails()
    const isFavorite = wishlistItems.some(item => item?.id === +id)
    const openedImage = searchParams[0].get('view') === 'true';
    const { product, isLoading, error, isNotFound } = useProduct(id);
    const { cartItems } = useCartDetails()

    const onImageClick = (): void => {
        searchParams[1]({ view: 'true' }, { replace: true })
    }

    const onCloseModal = (): void => {
        searchParams[1]({}, { replace: true })
    }

    const handleAddToWishlist = () => {
        onWishlist(+id)
    }

    useEffect(() => {
        scrollToTop();
    }, []);


    const handleCart = (id: number, type: 'inc' | 'dec') => {
        type === 'inc' ? onIncrease(id) : onDecrease(id)
    }

    if (isLoading || !product) return <ProductPageSkeleton />;
    if (error) return <ErrorView error={getErrorMessage(error)} />;
    if (isNotFound) return <Navigate to="/404" replace />;

    const { id: productId, title, price, description, category, brand, images,
        rating, reviews, discountPercentage, stock, sku, dimensions, weight, warrantyInformation, shippingInformation, returnPolicy } = product;

    const inStock = (stock ?? 0) > 0;
    const discountedPrice = discountPercentage > 0 ? formatPrice(applyDiscount({ price, discount: discountPercentage })) : null;
    const originalPrice = formatPrice(price);
    const itemInCart = cartItems.find(item => item?.id === product.id)
    const quantity = itemInCart?.quantity


    return (
        <main className={style['product-page']}>
            <ProductImageModal imageSrc={images[0]} imageAlt={title} onClose={onCloseModal} isOpen={openedImage} />
            <div className="container" key={productId}>
                <ProductHeader onClick={() => navigate(-1)} label='Back to catalog' />

                <div className={style['layout']}>
                    <div className={style['gallery-column']}>
                        <ProductGallery
                            imageUrl={images[0]}
                            title={title}
                            isFavorite={isFavorite}
                            handleAddToWishlist={handleAddToWishlist}
                            onClick={onImageClick}
                        />
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
                            productId={product.id}
                            handleCart={handleCart}
                            originalPrice={originalPrice}
                            discountedPriceFormatted={discountedPrice}
                            inStock={inStock}
                            stock={stock}
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