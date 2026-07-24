import { memo } from 'react';
import { Link } from 'react-router';
import { useGetProductsQuery, ProductCard, ProductCardSkeleton } from '@/entities/product';
import type { Category } from '@/entities/product';
import { WishlistToggleButton } from '@/features/wishlist-toggle';
import { HorizontalScroll } from '@/shared/ui';
import { useHaptics } from '@/shared/lib/hooks';
import style from './category-row.module.scss';

const ROW_LIMIT = 12;
const PRIORITY_CARD_COUNT = 8;

interface CategoryRowProps {
    category: Category;
    priority?: boolean;
}

export const CategoryRow = memo(({ category, priority = false }: CategoryRowProps) => {
    const { data, isLoading, error } = useGetProductsQuery({
        category: category.name,
        page: 1,
        limit: ROW_LIMIT,
    });
    const { light } = useHaptics();

    if (error) return null;
    if (!isLoading && (!data || data.ids.length === 0)) return null;

    const headingId = `category-row-heading-${category.slug}`;

    return (
        <section className={style.categoryRow} aria-labelledby={headingId}>
            <div className={style.categoryRow__header}>
                <h2 id={headingId} className={style.categoryRow__title}>{category.name}</h2>
                <Link
                    to={`/catalog?category=${category.slug}`}
                    className={style.categoryRow__viewAll}
                    onClick={light}
                >
                    View All
                </Link>
            </div>

            <HorizontalScroll ariaLabel={`${category.name} products`}>
                {
                    isLoading
                        ? Array.from({ length: ROW_LIMIT }).map((_, index) => (
                            <div key={`skeleton-${index}`} className={style.categoryRow__item}>
                                <ProductCardSkeleton />
                            </div>
                        ))
                        : data!.ids.map((id, index) => {
                            const product = data!.items[id];
                            return (
                                <div key={product.id} className={style.categoryRow__item}>
                                    <ProductCard
                                        product={product}
                                        priority={priority && index < PRIORITY_CARD_COUNT}
                                        actionSlot={<WishlistToggleButton productId={product.id} price={product.price} />}
                                    />
                                </div>
                            );
                        })
                }
            </HorizontalScroll>
        </section>
    );
});

CategoryRow.displayName = 'CategoryRow';
