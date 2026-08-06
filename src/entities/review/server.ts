// RSC-safe subset of this slice's public API — see entities/product/server.ts
// for why this exists (main index.ts's export * pulls in client-only UI/hooks
// and breaks Server Components that import it).
export { fetchReviews, fetchReviewStats } from './api/queries';
export { REVIEWS_PAGE_SIZE } from './model/types';
export type { ReviewRatingStats, PaginatedReviews, ReviewSort } from './model/types';
