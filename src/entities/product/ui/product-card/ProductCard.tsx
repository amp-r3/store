import { ProductCardImage, ProductCardBody, ProductCardFooter } from "./components";
import { FC } from 'react';
import { Link } from 'react-router-dom';
import style from './productCard.module.scss';
import { useGetSizesQuery } from '@/entities/product';
import { useHaptics } from "@/shared/lib/hooks";
import { Product } from "@/entities/product";
import { useWishlistActions } from "@/features/wishlist-toggle";
import { useWishlistDetails } from "@/entities/wishlist";

interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

export const ProductCard: FC<ProductCardProps> = ({ product, priority = false }) => {
    const { id, title, price, basePrice, category, thumbnail, rating, reviewsCount, discountPercentage } = product;
    const { data: sizes, isLoading: isSizesLoading } = useGetSizesQuery(+id)
    const { wishlistItems } = useWishlistDetails()
    const isFavorite = wishlistItems.some(item => item?.id === id)
    const { onWishlist } = useWishlistActions()
    const { soft } = useHaptics()
    const hasDiscount = discountPercentage > 0;

    const handleAddToWishlist = () => {
        onWishlist(id)
    }

    return (
        <article className={style.card}>
            <Link to={`/product/${id}`} className={style.card__link} aria-label={`View details for ${title}`} onClick={soft} />

            <ProductCardImage
                title={title}
                thumbnail={thumbnail}
                category={category}
                discountPercentage={discountPercentage}
                priority={priority}
                handleAddToWishlist={handleAddToWishlist}
                isFavorite={isFavorite}
                sizes={sizes || []}
                isSizesLoading={isSizesLoading}
            />

            <ProductCardBody
                title={title}
            />

            <ProductCardFooter
                basePrice={basePrice}
                price={price}
                hasDiscount={hasDiscount}
                rating={rating}
                reviewsCount={reviewsCount}
            />
        </article>
    );
};