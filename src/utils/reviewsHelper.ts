import { ProductReview } from "@/types/products";

export interface RatingStatsItem {
    stars: number;
    count: number;
    percentage: number;
}

export const calculateRatingStats = (reviews: ProductReview[]): RatingStatsItem[] => {
    const totalReviews = reviews.length;

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((review) => {
        if (review.rating >= 1 && review.rating <= 5) {
            counts[review.rating]++;
        }
    });

    return [5, 4, 3, 2, 1].map((stars) => {
        const count = counts[stars];
        const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

        return {
            stars,
            count,
            percentage
        };
    });
};