'use client';

import { ProductSpecs, ProductImageModal } from "./components";
import { ProductSummary } from "@/widgets/product-summary";
// React
import { useEffect, useState } from 'react';

// Router
import { useParams, notFound } from 'next/navigation';

// Components
import { ErrorView, ExpandableContent, PageLayout, ShareCopyBtn, HOME_CRUMB, CATALOG_CRUMB, categoryCrumb } from '@/shared/ui';
import { ProductGallery } from '@/widgets/product-gallery';

// Utils
// Custom Hooks
// Styles
import style from './productPage.module.scss';
import { useGetSizesQuery, useCheckPurchaseStatusQuery, useSelectedSize, useGetCategoriesQuery } from '@/entities/product';
import type { Product, ProductSize, Categories } from '@/entities/product';
import { ProductReviews } from '@/widgets/product-reviews';
import type { ReviewRatingStats, PaginatedReviews } from '@/entities/review';
import { getErrorMessage, scrollToTop } from "@/shared/lib";
import { useCartActions } from "@/features/cart-actions";
import { useCartDetails } from "@/entities/cart";
import { useProduct } from "@/entities/product";
import { useWishlistActions } from "@/features/wishlist-toggle";
import { useWishlistDetails } from "@/entities/wishlist";
import { useAppSelector } from "@/shared/model";
import { selectIsAuth } from "@/entities/session";

interface ProductPageProps {
    product: Product;
    sizes: ProductSize[];
    categories: Categories;
    initialReviewStats: ReviewRatingStats;
    initialReviews: PaginatedReviews;
}

// Server-fetched props seed the first paint with real content (SEO + no
// loading flash); the RTK Query hooks below still run so the page stays in
// sync with cache invalidation (e.g. rating/reviewsCount after a new review).
export const ProductPage = ({
    product: initialProduct,
    sizes: initialSizes,
    categories: initialCategories,
    initialReviewStats,
    initialReviews,
}: ProductPageProps) => {
    // Local rather than URL-synced (?view=true): the latter needs
    // useSearchParams, which forces this whole route to bail out to
    // client-side-only rendering during static generation for a
    // generateStaticParams route (Next throws BailoutToCSRError for
    // useSearchParams() used outside a Suspense boundary while
    // prerendering) — not worth losing SSR/ISR for the product page over a
    // deep-linkable zoom state.
    const [isImageOpen, setIsImageOpen] = useState(false);
    const { id } = useParams<{ id?: string }>();
    const { onIncrease, onDecrease } = useCartActions()
    const { onWishlist } = useWishlistActions()
    const { wishlistItems } = useWishlistDetails()
    const isFavorite = wishlistItems.some(item => item?.id === +(id || 0))
    const { product: liveProduct, error, isNotFound } = useProduct(id);
    const product = liveProduct ?? initialProduct;
    const { data: liveSizes } = useGetSizesQuery(+(id || 0))
    const sizes = liveSizes ?? initialSizes;
    const { selectedSizeId, setSelectedSizeId } = useSelectedSize(sizes);
    const { cartItems } = useCartDetails()
    const hasSizes = !!(sizes && sizes.length > 0);
    const isAuth = useAppSelector(selectIsAuth);
    const { data: lastPurchaseDate } = useCheckPurchaseStatusQuery(+(id || 0), {
        skip: !isAuth || !id
    });
    const { data: liveCategories } = useGetCategoriesQuery();
    const categories = liveCategories ?? initialCategories;



    const onImageClick = (): void => {
        setIsImageOpen(true);
    }

    const onCloseModal = (): void => {
        setIsImageOpen(false);
    }

    const handleAddToWishlist = () => {
        onWishlist(+(id || 0), product?.price)
    }

    useEffect(() => {
        scrollToTop();
    }, []);


    const handleCart = (sizeId: number, type: 'inc' | 'dec') => {
        if (!product) return;
        if (type === 'inc') {
            const stock = sizes?.find((size) => size.id === sizeId)?.stock;
            onIncrease(sizeId, product.id, stock);
        } else {
            onDecrease(sizeId, product.id);
        }
    }

    if (error) return <ErrorView error={getErrorMessage(error)} />;
    if (isNotFound) notFound();

    const { id: productId, title, basePrice, price, description, category, brand, images,
        rating, reviewsCount, discountPercentage, sku, dimensions, weight, warrantyInformation, shippingInformation, returnPolicy } = product;
    const hasDiscount = discountPercentage > 0;
    const itemInCart = cartItems.find(item => item?.productId === product.id && item?.sizeId === selectedSizeId)
    const quantity = itemInCart?.quantity || 0
    const categorySlug = categories?.find((c) => c.name === category)?.slug;
    const crumbs = [HOME_CRUMB, CATALOG_CRUMB, categoryCrumb(category, categorySlug), { label: title }];


    return (
        <PageLayout breadcrumbs={crumbs} actions={<ShareCopyBtn />}>
            <ProductImageModal imageSrc={images[0]} imageAlt={title} onClose={onCloseModal} isOpen={isImageOpen} />
            <div key={productId}>
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
                        <ProductSummary
                            productId={productId}
                            category={product.category}
                            brand={brand}
                            title={title}
                            rating={rating}
                            reviewsCount={reviewsCount}
                            lastPurchaseDate={lastPurchaseDate}
                            quantity={quantity}
                            handleCart={handleCart}
                            hasDiscount={hasDiscount}
                            originalPrice={basePrice}
                            discountedPrice={price}
                            sizes={sizes}
                            hasSizes={hasSizes}
                            selectedSizeId={selectedSizeId}
                            setSelectedSizeId={setSelectedSizeId}
                        />
                    </div>
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

                <ProductReviews
                    productId={productId}
                    initialStats={initialReviewStats}
                    initialReviews={initialReviews}
                />
            </div>
        </PageLayout>
    );
};
