// React
import { useEffect, useState } from 'react';

// Router
import { useNavigate, useParams, Navigate, useSearchParams } from 'react-router';

// Components
import { ErrorView, ExpandableContent } from '@/components/common';
import { ProductHeader } from './components/ProductHeader/ProductHeader';
import { ProductGallery } from './components/ProductGallery/ProductGallery';
import { ProductInfo } from './components/ProductInfo/ProductInfo';
import { ProductPurchaseBox } from './components/ProductPurchaseBox/ProductPurchaseBox';
import { ProductSpecs } from './components/ProductSpecs/ProductSpecs';
import { ProductImageModal } from './components/ProductImageModal/ProductImageModal';
import { ProductPageSkeleton } from './ProductPageSkeleton';

// Utils
import { getErrorMessage, scrollToTop } from '@/utils';

// Custom Hooks
import { useCartActions, useCartDetails, useMediaQuery, useProduct, useWishlistActions, useWishlistDetails } from '@/hooks';


// Styles
import style from './productPage.module.scss';
import { useGetReviewsQuery, useGetSizesQuery } from '@/services/productsApi';
import { ProductReviews } from './components/ProductReviews/ProductReviews';
import { ProductSizesSkeleton } from './components/ProductSizes/ProductSizesSkeleton';
import { ProductSizes } from './components/ProductSizes/ProductSizes';

export const ProductPage = () => {
    const navigate = useNavigate();
    const searchParams = useSearchParams()
    const { id } = useParams();
    const { onIncrease, onDecrease } = useCartActions()
    const { onWishlist } = useWishlistActions()
    const { wishlistItems } = useWishlistDetails()
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [selectedSizeId, setSelectedSizeId] = useState<number | undefined>(undefined);
    const isFavorite = wishlistItems.some(item => item?.id === +id)
    const openedImage = searchParams[0].get('view') === 'true';
    const { product, isLoading, error, isNotFound } = useProduct(id);
    const { data: reviews, isLoading: isReviewsLoading, isFetching: isReviewsFetching, isError: isReviewsError } = useGetReviewsQuery(+id)
    const { data: sizes, isLoading: isSizesLoading } = useGetSizesQuery(+id)
    const { cartItems } = useCartDetails()
    const hasSizes = sizes && sizes.length > 0;



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


    const handleCart = (sizeId: number, type: 'inc' | 'dec') => {
        type === 'inc' ? onIncrease(sizeId, product.id) : onDecrease(sizeId, product.id)
    }

    if (isLoading || !product) return <ProductPageSkeleton />;
    if (error) return <ErrorView error={getErrorMessage(error)} />;
    if (isNotFound) return <Navigate to="/404" replace />;

    const { id: productId, title, basePrice, price, description, category, brand, images,
        rating, reviewsCount, discountPercentage, sku, dimensions, weight, warrantyInformation, shippingInformation, returnPolicy } = product;
    const hasDiscount = discountPercentage > 0;
    const itemInCart = cartItems.find(item => item?.productId === product.id && item?.sizeId === selectedSizeId)
    const quantity = itemInCart?.quantity || 0


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
                            rating={rating}
                            reviewsCount={reviewsCount}
                        />
                        <ProductPurchaseBox
                            quantity={quantity}
                            productId={product.id}
                            handleCart={handleCart}
                            hasDiscount={hasDiscount}
                            originalPrice={basePrice}
                            discountedPrice={price}
                            sizes={sizes}
                            hasSizes={hasSizes}
                            selectedSizeId={selectedSizeId}
                            setSelectedSizeId={setSelectedSizeId}
                            isMobile={isMobile}
                            isSizesLoading={isSizesLoading}
                        />
                    </div>
                    {(isSizesLoading || (sizes && sizes.length > 0)) && isMobile ? (
                        <>
                            {isSizesLoading ? (
                                <ProductSizesSkeleton isCompact={!isMobile} />
                            ) : (
                                sizes && (
                                    <ProductSizes
                                        sizes={sizes}
                                        activeSizeId={selectedSizeId}
                                        onSizeSelect={setSelectedSizeId}
                                        isCompact={!isMobile}
                                    />
                                )
                            )}
                        </>
                    ) : ''}
                </div>

                <ExpandableContent maxHeight={100} className={style['description-wrapper']}>
                    <p className={style['description']}>{description}</p>
                </ExpandableContent>

                <ProductSpecs
                    sku={sku}
                    dimensions={dimensions}
                    weight={weight}
                    warranty={warrantyInformation}
                    shipping={shippingInformation}
                    returnPolicy={returnPolicy}
                />

                <ProductReviews reviews={reviews} rating={rating} />
            </div>
        </main>
    );
};