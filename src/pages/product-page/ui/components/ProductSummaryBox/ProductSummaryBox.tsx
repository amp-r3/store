import style from './product-summary-box.module.scss';
import { ProductSizes } from '../ProductSizes/ProductSizes';
import { ProductSizesSkeleton } from '../ProductSizes/ProductSizesSkeleton';
import { ProductSize } from "@/entities/product";
import { ProductInfo, ProductPurchaseStatusBadge, ProductPurchaseBox } from './components';

interface ProductSummaryBoxProps {
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

export const ProductSummaryBox = ({
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
}: ProductSummaryBoxProps) => {

    return (
        <div className={style['summary-box']}>
            <div className={style['summary-box__top']}>
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
                    <div className={style['summary-box__sizes-container']}>
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

            <div className={style['summary-box__bottom']}>
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
