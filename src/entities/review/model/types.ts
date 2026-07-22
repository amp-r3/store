export interface ProductReview {
    id: number;
    productId: number;
    rating: number;
    comment: string | null;
    date: string;
    helpfulCount: number;

    reviewerName: string | null;
    reviewerEmail: string | null;

    userId: string | null;
    isLiked: boolean;
    isEdited: boolean;
    isVerified: boolean;

    author?: {
        name: string;
        avatarUrl: string;
    };
}

/**
 * Minimal product shape the review cards need. Declared here rather than imported
 * from `@/entities/product` so the review slice stays free of entity↔entity coupling.
 */
export interface ReviewProductPreview {
    id: number;
    title: string;
    thumbnail: string;
}

export interface UnreviewedPurchase {
    productId: number;
    lastPurchasedAt: string;
    purchaseCount: number;
}

export interface RatingStatsItem {
    stars: number;
    count: number;
    percentage: number;
}

export interface ReviewRatingStats {
    total: number;
    distribution: RatingStatsItem[];
}

export const REVIEWS_PAGE_SIZE = 10;

export type ReviewSort = 'newest' | 'oldest' | 'most_helpful';

export interface ReviewsQueryArgs {
    productId: number;
    page?: number;
    limit?: number;
    sort?: ReviewSort;
    rating?: number | null;
}

export interface PaginatedReviews {
    items: ProductReview[];
    totalCount: number;
}
