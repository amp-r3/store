import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/products';
import style from './productCard.module.scss';
import { ProductCardImage } from './components/ProductCardImage';
import { ProductCardBody } from './components/ProductCardBody';
import { ProductCardFooter } from './components/ProductCardFooter';
import { useWishlistActions, useWishlistDetails, useHaptics } from '@/hooks';
import { useGetSizesQuery } from '@/services/productsApi';


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
                sizes={sizes}
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