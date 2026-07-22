import { ReviewRatingStats } from "@/entities/review";

export const buildRatingStats = (
    rows: { rating: number; review_count: number }[]
): ReviewRatingStats => {
    const total = rows.reduce((sum, row) => sum + row.review_count, 0);

    const distribution = rows
        .filter((row) => row.review_count > 0)
        .map((row) => ({
            stars: row.rating,
            count: row.review_count,
            percentage: total > 0 ? Math.round((row.review_count / total) * 100) : 0
        }))
        .sort((a, b) => b.stars - a.stars);

    return { total, distribution };
};
