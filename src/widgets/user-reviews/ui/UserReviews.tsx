import { useMemo } from 'react';
import { useSearchParams } from 'react-router';

import { useAppDispatch } from '@/shared/model';
import { useProductsByIds } from '@/entities/product';
import { openReviewModal } from '@/features/order-review';
import {
    useGetMyReviewsQuery,
    useGetUnreviewedPurchasesQuery,
    UserReviewCard,
    UserReviewCardSkeleton,
    PendingReviewCard,
    PendingReviewCardSkeleton,
    ReviewProductPreview,
} from '@/entities/review';

import { UserReviewsHeader, UserReviewsTabs, UserReviewsEmpty } from './components';
import type { ReviewsTab } from './components';
import style from './user-reviews.module.scss';

/** Cap the entry-animation stagger so long lists don't crawl in. */
const MAX_STAGGER_INDEX = 8;

export const UserReviews = () => {
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();

    const tab: ReviewsTab = searchParams.get('tab') === 'pending' ? 'pending' : 'written';

    const {
        data: reviews = [],
        isLoading: isReviewsLoading,
        isError: isReviewsError,
    } = useGetMyReviewsQuery();

    const {
        data: pending = [],
        isLoading: isPendingLoading,
        isError: isPendingError,
    } = useGetUnreviewedPurchasesQuery();

    const productIds = useMemo(
        () => Array.from(new Set([
            ...reviews.map((review) => review.productId),
            ...pending.map((purchase) => purchase.productId),
        ])),
        [reviews, pending]
    );

    const { products, isLoading: isProductsLoading } = useProductsByIds(productIds);

    const productsById = useMemo(
        () => products.reduce<Record<number, ReviewProductPreview>>((acc, product) => {
            acc[product.id] = {
                id: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
            };
            return acc;
        }, {}),
        [products]
    );

    const isTabLoading = tab === 'written'
        ? isReviewsLoading || isProductsLoading
        : isPendingLoading || isProductsLoading;

    const isStatsLoading = isReviewsLoading || isPendingLoading;

    const handleTabChange = (next: ReviewsTab) => {
        setSearchParams(
            (params) => {
                if (next === 'pending') {
                    params.set('tab', 'pending');
                } else {
                    params.delete('tab');
                }
                return params;
            },
            { replace: true }
        );
    };

    const renderList = () => {
        // Each tab fails on its own: the Pending tab depends on the
        // get_unreviewed_purchases RPC, the Written tab does not.
        const isTabError = tab === 'written' ? isReviewsError : isPendingError;

        if (isTabError) {
            return (
                <p className={style['user-reviews__error']} role="alert">
                    We couldn&apos;t load this list right now. Please try again later.
                </p>
            );
        }

        if (isTabLoading) {
            return tab === 'written'
                ? <UserReviewCardSkeleton count={3} />
                : <PendingReviewCardSkeleton count={3} />;
        }

        if (tab === 'written') {
            if (reviews.length === 0) {
                return <UserReviewsEmpty variant="written" hasPending={pending.length > 0} />;
            }

            return reviews.map((review, index) => (
                <div
                    key={review.id}
                    className={style['user-reviews__item']}
                    style={{ animationDelay: `${Math.min(index, MAX_STAGGER_INDEX) * 40}ms` }}
                >
                    <UserReviewCard
                        review={review}
                        product={productsById[review.productId]}
                        onEdit={() => dispatch(openReviewModal(review.productId.toString()))}
                    />
                </div>
            ));
        }

        if (pending.length === 0) {
            return <UserReviewsEmpty variant="pending" hasPending={false} />;
        }

        return pending.map((purchase, index) => (
            <div
                key={purchase.productId}
                className={style['user-reviews__item']}
                style={{ animationDelay: `${Math.min(index, MAX_STAGGER_INDEX) * 40}ms` }}
            >
                <PendingReviewCard
                    purchase={purchase}
                    product={productsById[purchase.productId]}
                    onRate={(rating) =>
                        dispatch(openReviewModal(purchase.productId.toString(), rating))
                    }
                />
            </div>
        ));
    };

    return (
        <div className={style['user-reviews']}>
            <UserReviewsHeader reviews={reviews} pendingCount={pending.length} isLoading={isStatsLoading} />

            <UserReviewsTabs
                tab={tab}
                writtenCount={reviews.length}
                pendingCount={pending.length}
                onChange={handleTabChange}
            />

            <div
                className={style['user-reviews__list']}
                role="tabpanel"
                id={`user-reviews-panel-${tab}`}
                aria-labelledby={`user-reviews-tab-${tab}`}
                aria-live="polite"
            >
                {renderList()}
            </div>
        </div>
    );
};
