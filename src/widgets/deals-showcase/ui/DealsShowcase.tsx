import { memo } from 'react';
import { Link } from 'react-router';
import { IoFlame } from 'react-icons/io5';
import { useGetDealsProductsQuery, ProductCard, ProductCardSkeleton } from '@/entities/product';
import { WishlistToggleButton } from '@/features/wishlist-toggle';
import { HorizontalScroll } from '@/shared/ui';
import { useHaptics } from '@/shared/lib/hooks';
import style from './deals-showcase.module.scss';

const DEALS_LIMIT = 12;
const SKELETON_CARDS_COUNT = 4;

export const DealsShowcase = memo(() => {
    const { data: products, isLoading, error } = useGetDealsProductsQuery({ limit: DEALS_LIMIT });
    const { soft } = useHaptics();

    if (error) return null;
    if (!isLoading && (!products || products.length === 0)) return null;

    return (
        <section className={style.dealsShowcase} aria-labelledby="deals-showcase-heading">
            <div className={`${style.dealsShowcase__inner} container`}>
                <div className={style.dealsShowcase__header}>
                    <h2 id="deals-showcase-heading" className={style.dealsShowcase__title}>
                        <IoFlame className={style.dealsShowcase__titleIcon} aria-hidden="true" />
                        Hot Deals
                    </h2>
                    <Link to="/catalog" className={style.dealsShowcase__viewAll} onClick={soft}>
                        View All
                    </Link>
                </div>

                <HorizontalScroll ariaLabel="Discounted products">
                    {
                        isLoading
                            ? Array.from({ length: SKELETON_CARDS_COUNT }).map((_, index) => (
                                <div key={`deals-skeleton-${index}`} className={style.dealsShowcase__item}>
                                    <ProductCardSkeleton />
                                </div>
                            ))
                            : products!.map((product) => (
                                <div key={product.id} className={style.dealsShowcase__item}>
                                    <ProductCard
                                        product={product}
                                        actionSlot={<WishlistToggleButton productId={product.id} />}
                                    />
                                </div>
                            ))
                    }
                </HorizontalScroll>
            </div>
        </section>
    );
});

DealsShowcase.displayName = 'DealsShowcase';
