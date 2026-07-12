import { ProductHeader, ProductPurchaseBox, ProductSpecs, ProductImageModal, ProductSizesSkeleton, ProductSizes, ProductPurchaseStatusBadge } from "./components";
// React
import { useEffect, useState } from 'react';

// Router
import { useNavigate, useParams, Navigate, useSearchParams } from 'react-router';

// Components
import { ErrorView, ExpandableContent } from '@/shared/ui';
import { ProductGallery } from '../../../widgets/product-gallery/ProductGallery';
import { ProductInfo } from '../../../widgets/product-info/ProductInfo';
import { ProductPageSkeleton } from './ProductPageSkeleton';

// Utils
// Custom Hooks
// Styles
import style from './productPage.module.scss';
import { useGetSizesQuery, useCheckPurchaseStatusQuery } from '@/entities/product';
import { useGetReviewsQuery } from '@/entities/review';
import { ProductReviews } from '../../../widgets/product-reviews/ProductReviews';
import { getErrorMessage, scrollToTop } from "@/shared/lib";
import { useMediaQuery } from "@/shared/lib/hooks";
import { useCartActions } from "@/features/cart-actions";
import { useCartDetails } from "@/entities/cart";
import { useProduct } from "@/entities/product";
import { useWishlistActions } from "@/features/wishlist-toggle";
import { useWishlistDetails } from "@/entities/wishlist";
import { useAppSelector } from "@/shared/model";
import { selectIsAuth } from "@/entities/session";

export const ProductPage = () => {
    const navigate = useNavigate();
    const searchParams = useSearchParams()
    const { id } = useParams();
    const { onIncrease, onDecrease } = useCartActions()
    const { onWishlist } = useWishlistActions()
    const { wishlistItems } = useWishlistDetails()
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [selectedSizeId, setSelectedSizeId] = useState<number | undefined>(undefined);
    const isFavorite = wishlistItems.some(item => item?.id === +(id || 0))
    const openedImage = searchParams[0].get('view') === 'true';
    const { product, isLoading, error, isNotFound } = useProduct(id);
    const { data: reviews } = useGetReviewsQuery(+(id || 0))
    const { data: sizes, isLoading: isSizesLoading } = useGetSizesQuery(+(id || 0))
    const { cartItems } = useCartDetails()
    const hasSizes = !!(sizes && sizes.length > 0);
    const isAuth = useAppSelector(selectIsAuth);
    const { data: lastPurchaseDate } = useCheckPurchaseStatusQuery(+(id || 0), {
        skip: !isAuth || !id
    });



    const onImageClick = (): void => {
        searchParams[1]({ view: 'true' }, { replace: true })
    }

    const onCloseModal = (): void => {
        searchParams[1]({}, { replace: true })
    }

    const handleAddToWishlist = () => {
        onWishlist(+(id || 0))
    }

    useEffect(() => {
        scrollToTop();
    }, []);


    const handleCart = (sizeId: number, type: 'inc' | 'dec') => {
        if (!product) return;
        if (type === 'inc') {
            onIncrease(sizeId, product.id);
        } else {
            onDecrease(sizeId, product.id);
        }
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
                        {lastPurchaseDate && (
                            <ProductPurchaseStatusBadge
                                productId={product.id} 
                                purchaseDate={lastPurchaseDate} 
                            />
                        )}
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

                <ProductReviews reviews={reviews || []} rating={rating} />
            </div>
        </main>
    );
};