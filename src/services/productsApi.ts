import { supabase } from "@/supabase";
import { Product, ProductReview } from "@/types/products";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Category {
    slug: string;
    name: string;
}
export type Categories = Category[]

export interface ProductParams {
    page?: number;
    sortBy?: string | null;
    order?: string | null;
    search?: string | null;
    category?: string | null;
    limit?: number | null;
}

export interface ProductsResponse {
    items: Record<number, Product>;
    ids: number[];
    total: number;
}

interface ProductReviewResponse {
    id: number;
    product_id: number;
    rating: number;
    comment: string | null;
    date: string;
    user_id: string | null;
    helpful_count: number;
    reviewer_name: string | null;
    reviewer_email: string | null;
}

export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery: fakeBaseQuery(),
    tagTypes: ['Product', 'Category'],
    endpoints: (builder) => ({

        getProducts: builder.query<ProductsResponse, ProductParams>({
            async queryFn(params) {
                try {
                    const { page = 1, search, sortBy, order, category } = params;
                    const limit = params.limit ?? 12;

                    const from = (page - 1) * limit;
                    const to = from + limit - 1;

                    let query = supabase
                        .from('products_view')
                        .select('*', { count: 'exact' });

                    if (search) {
                        query = query.ilike('title', `%${search}%`);
                    }

                    if (category && category !== 'all') {
                        query = query.eq('category', category);
                    }

                    if (sortBy && order) {
                        query = query.order(sortBy, { ascending: order === 'asc' });
                    } else {
                        query = query.order('id', { ascending: true });
                    }

                    query = query.range(from, to);

                    const { data, error, count } = await query;

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    const items = (data as Product[]).reduce((acc, curr) => {
                        acc[curr.id] = curr;
                        return acc;
                    }, {} as Record<number, Product>);

                    const ids = (data as Product[]).map((product) => product.id);

                    return {
                        data: {
                            items,
                            ids,
                            total: count ?? 0
                        }
                    };
                } catch (err: any) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: err.message }
                    };
                }
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.ids.map((id) => ({ type: 'Product' as const, id })),
                        { type: 'Product', id: 'LIST' },
                    ]
                    : [{ type: 'Product', id: 'LIST' }],
        }),

        getCategories: builder.query<Categories, void>({
            async queryFn() {
                try {
                    const { data, error } = await supabase
                        .from('categories')
                        .select('slug, name');

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    const defaultCategory: Category = {
                        slug: 'all',
                        name: 'All Products',
                    };

                    return { data: [defaultCategory, ...(data || [])] as Categories };

                } catch (err: any) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: err.message }
                    };
                }
            },
            providesTags: [{ type: 'Category', id: 'LIST' }]
        }),

        getProductById: builder.query<Product, number>({
            async queryFn(id) {
                try {
                    const { data, error } = await supabase
                        .from('products_view')
                        .select('*')
                        .eq('id', id)
                        .single();

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    return { data: data as Product };
                } catch (err: any) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: err.message }
                    };
                }
            },
            providesTags: (_, __, id) => [{ type: 'Product', id }],
        }),

        getProductArrayById: builder.query<Product[], number[]>({
            async queryFn(ids) {
                try {
                    const { data, error } = await supabase
                        .from('products_view')
                        .select('*')
                        .in('id', ids);

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    return { data: data as Product[] };
                } catch (err: any) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: err.message }
                    };
                }
            }
        }),
        getReviews: builder.query<ProductReview[], number>({
            async queryFn(id) {
                try {
                    const { data, error } = await supabase
                        .from('product_reviews')
                        .select('*')
                        .eq('product_id', id)
                        .order('date', { ascending: false });

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    const reviews: ProductReview[] = (data as ProductReviewResponse[]).map((review) => (
                        {
                            id: review.id,
                            productId: review.product_id,
                            rating: review.rating,
                            comment: review.comment,
                            date: review.date,
                            userId: review.user_id,
                            helpfulCount: review.helpful_count,
                            reviewerName: review.reviewer_name,
                            reviewerEmail: review.reviewer_email,
                        }
                    )
                    )

                    return { data: reviews as ProductReview[] }
                } catch (error) {

                }
            }
        })
    }),
});

export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useGetCategoriesQuery,
    useGetProductArrayByIdQuery,
    useGetReviewsQuery,
} = productsApi;