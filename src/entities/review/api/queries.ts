import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/api';
import {
  ProductReview,
  ReviewRatingStats,
  ReviewsQueryArgs,
  PaginatedReviews,
  REVIEWS_PAGE_SIZE,
} from '../model/types';
import { buildRatingStats } from '../lib/reviewsHelper';

// Pure Supabase query functions — one source of truth for both RTK Query's
// queryFn (browser client) and RSC (server client). They throw on failure;
// reviewApi.ts's queryFn wrappers translate that into `{ error }`.

export const REVIEW_SELECT = `
    *,
    public_profiles (
        username
    )
`;

export type ProductReviewRow = Database['public']['Tables']['product_reviews']['Row'] & {
  public_profiles: Pick<Database['public']['Views']['public_profiles']['Row'], 'username'> | null;
};

export const mapReview = (review: ProductReviewRow, likedIds: Set<number>): ProductReview => {
  const finalName = review.public_profiles?.username || 'Anonymous';

  return {
    id: review.id,
    productId: review.product_id,
    rating: review.rating,
    comment: review.comment,
    date: review.date,
    userId: review.user_id,
    helpfulCount: review.helpful_count,
    reviewerName: finalName,
    isLiked: likedIds.has(review.id),
    isEdited: review.is_edited,
    isVerified: review.is_verified,
  };
};

export async function fetchReviews(
  db: SupabaseClient<Database>,
  {
    productId,
    page = 1,
    limit = REVIEWS_PAGE_SIZE,
    sort = 'newest',
    rating = null,
  }: ReviewsQueryArgs,
): Promise<PaginatedReviews> {
  const from = (page - 1) * limit;
  const to = page * limit - 1;

  let query = db
    .from('product_reviews')
    .select(REVIEW_SELECT, { count: 'exact' })
    .eq('product_id', productId);

  if (rating) {
    query = query.eq('rating', rating);
  }

  if (sort === 'most_helpful') {
    query = query.order('helpful_count', { ascending: false }).order('date', { ascending: false });
  } else {
    query = query.order('date', { ascending: sort === 'oldest' });
  }

  query = query.order('id', { ascending: sort === 'oldest' }).range(from, to);

  const [
    { data: reviewsData, error: reviewsError, count },
    {
      data: { user },
    },
  ] = await Promise.all([query, db.auth.getUser()]);

  if (reviewsError) throw reviewsError;
  if (!reviewsData) return { items: [], totalCount: 0 };

  const userLikes = new Set<number>();

  if (user && reviewsData.length > 0) {
    const reviewIds = reviewsData.map((r) => r.id);

    const { data: likesData } = await db
      .from('review_likes')
      .select('review_id')
      .eq('user_id', user.id)
      .in('review_id', reviewIds);

    if (likesData) {
      likesData.forEach((like) => userLikes.add(like.review_id));
    }
  }

  const items = reviewsData.map((review) => mapReview(review, userLikes));

  return { items, totalCount: count ?? 0 };
}

export async function fetchReviewStats(
  db: SupabaseClient<Database>,
  productId: number,
): Promise<ReviewRatingStats> {
  const { data, error } = await db.rpc('get_review_stats', { p_product_id: productId });

  if (error) throw error;

  return buildRatingStats(data ?? []);
}
