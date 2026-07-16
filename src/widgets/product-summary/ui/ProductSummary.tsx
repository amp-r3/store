import style from './product-summary.module.scss';
import { ProductSizes } from './components/ProductSizes/ProductSizes';
import { ProductSizesSkeleton } from './components/ProductSizes/ProductSizesSkeleton';
import { ProductSize } from "@/entities/product";
import { ProductInfo, ProductPurchaseStatusBadge, ProductPurchaseBox } from './components';

interface ProductSummaryProps {
    productId: number;
    category: string;
    brand: string;
    title: string;
    rating: number;
    reviewsCount: number;
    lastPurchaseDate?: string | null;
    quantity: number;
    hasDiscount: boolean;
    originalPrice: number;
    discountedPrice: number;
    handleCart(sizeId: number, type: 'inc' | 'dec'): void;
    sizes?: ProductSize[];
    setSelectedSizeId(id: number | undefined): void;
    selectedSizeId: number | undefined;
    hasSizes: boolean;
    isSizesLoading?: boolean;
}

export const ProductSummary = ({
    productId,
    category,
    brand,
    title,
    rating,
    reviewsCount,
    lastPurchaseDate,
    quantity,
    hasDiscount,
    originalPrice,
    discountedPrice,
    handleCart,
    sizes,
    setSelectedSizeId,
    selectedSizeId,
    hasSizes,
    isSizesLoading = false,
}: ProductSummaryProps) => {

    return (
        <div className={style.summary}>
            <div className={style.top}>
                <ProductInfo 
                    category={category}
                    brand={brand}
                    title={title}
                    rating={rating}
                    reviewsCount={reviewsCount}
                />

                {lastPurchaseDate && (
                    <ProductPurchaseStatusBadge 
                        productId={productId} 
                        purchaseDate={lastPurchaseDate} 
                    />
                )}

                {(isSizesLoading || (sizes && sizes.length > 0)) && (
                    <div className={style.sizesContainer}>
                        {isSizesLoading ? (
                            <ProductSizesSkeleton />
                        ) : (
                            sizes && (
                                <ProductSizes
                                    sizes={sizes}
                                    activeSizeId={selectedSizeId}
                                    onSizeSelect={setSelectedSizeId}
                                />
                            )
                        )}
                    </div>
                )}
            </div>

            <div className={style.bottom}>
                <ProductPurchaseBox 
                    productId={productId}
                    quantity={quantity}
                    hasDiscount={hasDiscount}
                    originalPrice={originalPrice}
                    discountedPrice={discountedPrice}
                    handleCart={handleCart}
                    sizes={sizes}
                    selectedSizeId={selectedSizeId}
                    hasSizes={hasSizes}
                />
            </div>
        </div>
    );
};
