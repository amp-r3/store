import { FC, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CartItem, Product } from '@/types/products';
import { applyDiscount } from '@/utils';
import style from './productCard.module.scss';
import { ProductCardImage } from './components/ProductCardImage';
import { ProductCardBody } from './components/ProductCardBody';
import { ProductCardFooter } from './components/ProductCardFooter';
import { useAppSelector, useHaptics } from '@/hooks';
import { selectIsMaxReached } from '@/store';

interface ProductCardProps {
    product: Product;
    itemInCart: CartItem[];
    handleAddToCart: (product: Product) => void;
    priority?: boolean
}

export const ProductCard: FC<ProductCardProps> = ({ product, handleAddToCart, priority = false }) => {
    const { id, title, price, category, thumbnail, rating, reviews, discountPercentage, stock } = product;
    const { soft } = useHaptics()
    const inStock = (stock ?? 0) > 0;
    const discountedPrice = applyDiscount({ price, discount: discountPercentage });
    const hasDiscount = discountPercentage > 0;
    const isMaxReached = useAppSelector(
        useMemo(()=> selectIsMaxReached(id, stock), [id, stock])
    )

    return (
        <article className={style.card}>
            <Link to={`/product/${id}`} className={style.card__link} aria-label={`View details for ${title}`} onClick={soft} />

            <ProductCardImage
                title={title}
                thumbnail={thumbnail}
                category={category}
                discountPercentage={discountPercentage}
                priority={priority}
            />

            <ProductCardBody
                title={title}
                stock={stock}
                rating={rating}
                reviews={reviews}
            />

            <ProductCardFooter
                product={product}
                price={price}
                discountedPrice={discountedPrice}
                hasDiscount={hasDiscount}
                handleAddToCart={handleAddToCart}
                inStock={inStock}
                isMaxReached={isMaxReached}
                haptic={soft}
            />
        </article>
    );
};