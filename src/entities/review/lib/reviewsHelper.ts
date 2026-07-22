import { ReviewRatingStats } from "@/entities/review";

export const buildRatingStats = (
    rows: { rating: number; review_count: number }[]
): ReviewRatingStats => {
    const total = rows.reduce((sum, row) => sum + row.review_count, 0);
    const countByStars = new Map(rows.map((row) => [row.rating, row.review_count]));

    const distribution = [5, 4, 3, 2, 1].map((stars) => {
        const count = countByStars.get(stars) ?? 0;
        return {
            stars,
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0
        };
    });

    return { total, distribution };
};
