import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '@/types/products';
import { applyDiscount } from '@/utils';
import style from './productCard.module.scss';
import { ProductCardImage } from './components/ProductCardImage';
import { ProductCardBody } from './components/ProductCardBody';
import { ProductCardFooter } from './components/ProductCardFooter';
import { useAppDispatch, useAppSelector, useHaptics } from '@/hooks';
import { selectCartItemsArray, selectIsMaxReached } from '@/store';
import { addToCart } from '@/store/slices/cartSlice';
import { toogleFavorite } from '@/store/slices/wishlistSlice';
import { selectIsFavorite } from '@/store/selectors/wishlistSelectors';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface ProductCardProps {
    product: Product;
    priority?: boolean;
    isLoading: boolean;
}

export const ProductCard: FC<ProductCardProps> = ({ product, priority = false, isLoading }) => {
    if (isLoading || !product) return <ProductCardSkeleton />

    const dispatch = useAppDispatch()
    const { id, title, price, category, thumbnail, rating, reviews, discountPercentage, stock } = product;
    const cartItems = useAppSelector(selectCartItemsArray)
    const itemInCart = cartItems.find(item => item.id === product.id)
    const isFavorite = useAppSelector(state => selectIsFavorite(state, id))
    const quantity = itemInCart?.quantity
    const { soft } = useHaptics()
    const inStock = (stock ?? 0) > 0;
    const discountedPrice = applyDiscount({ price, discount: discountPercentage });
    const hasDiscount = discountPercentage > 0;

    const isMaxReached = useAppSelector(() => selectIsMaxReached(quantity ?? 0, stock ?? 0));

    const handleAddToCart = () => {
        dispatch(addToCart(id))
    }
    const handleAddToWishlist = () => {
        dispatch(toogleFavorite(id))
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
                handleAddToCart={handleAddToCart}
                inStock={inStock}
                isMaxReached={isMaxReached}
            />
        </article>
    );
};