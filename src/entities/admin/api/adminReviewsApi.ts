import { supabase, baseApi } from '@/shared/api';
import type { Database } from '@/shared/api';

// products!inner (not the default left-join embed): PostgREST only applies a
// dot-path filter on an embedded resource (.ilike('products.title', ...)
// below) when that embed is an inner join. product_id is NOT NULL, so the
// inner join never drops a row that the left join would have kept.
const ADMIN_REVIEW_SELECT = `
    *,
    products!inner ( title ),
    public_profiles ( username )
`;

type AdminReviewRow = Database['public']['Tables']['product_reviews']['Row'] & {
  products: Pick<Database['public']['Tables']['products']['Row'], 'title'> | null;
  public_profiles: Pick<Database['public']['Views']['public_profiles']['Row'], 'username'> | null;
};

export interface AdminReview {
  id: number;
  productId: number;
  productTitle: string;
  rating: number;
  comment: string | null;
  date: string;
  userId: string | null;
  reviewerName: string;
  helpfulCount: number;
  isVerified: boolean;
}

export interface AdminReviewsQueryArgs {
  page: number;
  limit: number;
  /** Trimmed product-title fragment; empty/undefined = no filter. */
  search?: string;
}

export interface PaginatedAdminReviews {
  items: AdminReview[];
  totalCount: number;
}

const mapAdminReview = (row: AdminReviewRow): AdminReview => ({
  id: row.id,
  productId: row.product_id,
  // products.title is NOT NULL and order_items/product_reviews.product_id is
  // `on delete cascade`/`restrict`-backed, so the join is never actually
  // null in practice; the '' fallback only guards the embed's own typing.
  productTitle: row.products?.title ?? '',
  rating: row.rating,
  comment: row.comment,
  date: row.date,
  userId: row.user_id,
  reviewerName: row.public_profiles?.username || 'Anonymous',
  helpfulCount: row.helpful_count,
  isVerified: row.is_verified,
});

export const adminReviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminReviews: builder.query<PaginatedAdminReviews, AdminReviewsQueryArgs>({
      queryFn: async ({ page, limit, search }) => {
        const from = (page - 1) * limit;
        const to = page * limit - 1;

        let query = supabase
          .from('product_reviews')
          .select(ADMIN_REVIEW_SELECT, { count: 'exact' });

        const trimmedSearch = search?.trim();
        if (trimmedSearch) {
          query = query.ilike('products.title', `%${trimmedSearch}%`);
        }

        const { data, error, count } = await query
          .order('date', { ascending: false })
          .range(from, to);

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return {
          data: {
            items: (data as unknown as AdminReviewRow[]).map(mapAdminReview),
            totalCount: count ?? 0,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => ({ type: 'Review' as const, id: item.id })), { type: 'Review', id: 'ADMIN_LIST' }]
          : [{ type: 'Review', id: 'ADMIN_LIST' }],
    }),

    deleteAdminReview: builder.mutation<null, { reviewId: number; productId: number }>({
      queryFn: async ({ reviewId }) => {
        const { error } = await supabase.rpc('admin_delete_review', { p_review_id: reviewId });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      // 'Product' too: on_review_change recalculates products.rating/reviews_count.
      invalidatesTags: (_result, _error, { reviewId, productId }) => [
        { type: 'Review', id: reviewId },
        { type: 'Review', id: 'ADMIN_LIST' },
        { type: 'Product', id: productId },
      ],
    }),
  }),
});

export const { useGetAdminReviewsQuery, useDeleteAdminReviewMutation } = adminReviewsApi;
