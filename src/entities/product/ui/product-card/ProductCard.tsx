import { ProductCardImage, ProductCardBody, ProductCardFooter } from "./";
import { FC } from 'react';
import { Link } from 'react-router-dom';
import style from './product-card.module.scss';
import { useGetSizesQuery } from '@/entities/product';
import { useHaptics } from "@/shared/lib/hooks";
import { Product } from "@/entities/product";

interface ProductCardProps {
    product: Product;
    priority?: boolean;
    actionSlot?: React.ReactNode;
}

export const ProductCard: FC<ProductCardProps> = ({ product, priority = false, actionSlot }) => {
    const { id, title, price, basePrice, category, thumbnail, rating, reviewsCount, discountPercentage } = product;
    const { data: sizes, isLoading: isSizesLoading } = useGetSizesQuery(+id)
    const { soft } = useHaptics()
    const hasDiscount = discountPercentage > 0;

    return (
        <article className={style.card}>
            <Link to={`/product/${id}`} className={style.card__link} aria-label={`View details for ${title}`} onClick={soft} />

            <ProductCardImage
                title={title}
                thumbnail={thumbnail}
                category={category}
                discountPercentage={discountPercentage}
                priority={priority}
                actionSlot={actionSlot}
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