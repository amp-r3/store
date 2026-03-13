import { FC } from 'react';
import { Link } from 'react-router-dom';
import { CartItem, Product } from '@/types/products';
import { applyDiscount } from '@/utils';
import style from './productCard.module.scss';
import { ProductCardImage } from './components/ProductCardImage';
import { ProductCardBody } from './components/ProductCardBody';
import { ProductCardFooter } from './components/ProductCardFooter';
import { useHaptics } from '@/hooks';

interface ProductCardProps {
    product: Product;
    itemInCart: CartItem[];
    handleAddToCart: (product: Product) => void;
}

export const ProductCard: FC<ProductCardProps> = ({ product, handleAddToCart, itemInCart }) => {
    const { id, title, price, category, thumbnail, rating, reviews, discountPercentage, stock } = product;
    const { soft } = useHaptics()
    const inStock = (stock ?? 0) > 0;
    const discountedPrice = applyDiscount({ price, discount: discountPercentage });
    const hasDiscount = discountPercentage > 0;
    const isMaxValue = itemInCart.some(item =>  item.quantity >= stock )

    return (
        <article className={style.card}>
            <Link to={`/product/${id}`} className={style.card__link} aria-label={`View details for ${title}`} onClick={soft} />

            <ProductCardImage
                title={title}
                thumbnail={thumbnail}
                category={category}
                discountPercentage={discountPercentage}
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
                isMaxValue={isMaxValue}
                haptic={soft}
            />
        </article>
    );
};