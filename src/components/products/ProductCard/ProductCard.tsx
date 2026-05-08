import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/products';
import { applyDiscount } from '@/utils';
import style from './productCard.module.scss';
import { ProductCardImage } from './components/ProductCardImage';
import { ProductCardBody } from './components/ProductCardBody';
import { ProductCardFooter } from './components/ProductCardFooter';
import { useAppDispatch, useAppSelector, useCartActions, useCartDetails, useHaptics, useWishlistActions, useWishlistDetails } from '@/hooks';
import { selectIsMaxReached } from '@/store';


interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

export const ProductCard: FC<ProductCardProps> = ({ product, priority = false }) => {
    const { onIncrease, onDecrease } = useCartActions()
    const { id, title, price, category, thumbnail, rating, reviews, discountPercentage, stock } = product;
    const { cartItems } = useCartDetails()
    const itemInCart = cartItems.find(item => item?.id === product.id)
    const { wishlistItems } = useWishlistDetails()
    const isFavorite = wishlistItems.some(item => item?.id === id)
    const { onWishlist } = useWishlistActions()
    const quantity = itemInCart?.quantity
    const { soft } = useHaptics()
    const inStock = (stock ?? 0) > 0;
    const discountedPrice = applyDiscount({ price, discount: discountPercentage });
    const hasDiscount = discountPercentage > 0;

    const isMaxReached = useAppSelector(() => selectIsMaxReached(quantity ?? 0, stock ?? 0));

    const handleCart = (id: number, type: 'inc' | 'dec') => {
        type === 'inc' ? onIncrease(id) : onDecrease(id)
    }

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
            />

            <ProductCardBody
                title={title}
                stock={stock}
                rating={rating}
                reviews={reviews}
            />

            <ProductCardFooter
                product={product}
                quantity={quantity}
                price={price}
                discountedPrice={discountedPrice}
                hasDiscount={hasDiscount}
                handleCart={handleCart}
                inStock={inStock}
                isMaxReached={isMaxReached}
            />
        </article>
    );
};