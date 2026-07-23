import { supabase, baseApi } from "@/shared/api";
import { Product, ProductSize } from "@/entities/product/model/types";
import { getErrorMessage } from "@/shared/lib";


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
    deals?: boolean;
}

export interface ProductsResponse {
    items: Record<number, Product>;
    ids: number[];
    total: number;
}



export const productsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getProducts: builder.query<ProductsResponse, ProductParams>({
            async queryFn(params) {
                try {
                    const { page = 1, search, sortBy, order, category, deals } = params;
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

                    if (deals) {
                        query = query.gt('discountPercentage', 0);
                    }

                    if (sortBy && order) {
                        query = query.order(sortBy, { ascending: order === 'asc' });
                    } else if (deals) {
                        query = query
                            .order('discountPercentage', { ascending: false })
                            .order('id', { ascending: true });
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

                    // products_view is a Postgres view: PG cannot express NOT
                    // NULL for view columns, so every generated column is
                    // `| null`. The view's underlying columns are NOT NULL —
                    // cast once here.
                    const rows = data as unknown as Product[];

                    const items = rows.reduce((acc, curr) => {
                        acc[curr.id] = curr;
                        return acc;
                    }, {} as Record<number, Product>);

                    const ids = rows.map((product) => product.id);

                    return {
                        data: {
                            items,
                            ids,
                            total: count ?? 0
                        }
                    };
                } catch (err) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(err) }
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

                    return { data: [defaultCategory, ...(data ?? [])] };

                } catch (err) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(err) }
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

                    // products_view is a Postgres view: PG cannot express NOT
                    // NULL for view columns, so every generated column is
                    // `| null`. The view's underlying columns are NOT NULL —
                    // cast once here.
                    return { data: data as unknown as Product };
                } catch (err) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(err) }
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

                    // products_view is a Postgres view: PG cannot express NOT
                    // NULL for view columns, so every generated column is
                    // `| null`. The view's underlying columns are NOT NULL —
                    // cast once here.
                    return { data: data as unknown as Product[] };
                } catch (err) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(err) }
                    };
                }
            }
        }),


        getSizes: builder.query<ProductSize[], number>({
            async queryFn(id) {
                try {
                    const { data: sizes, error } = await supabase
                        .from('product_sizes')
                        .select('id, value, stock')
                        .eq('product_id', id)
                        .order('id', { ascending: true });

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    return { data: sizes }
                } catch (error) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) }
                    };
                }
            },
            providesTags: (_result, _error, productId) => [{ type: 'Size', id: productId }]
        }),

        getDealsProducts: builder.query<Product[], { limit?: number } | void>({
            async queryFn(params) {
                try {
                    const limit = params?.limit ?? 12;

                    const { data, error } = await supabase
                        .from('products_view')
                        .select('*')
                        .gt('discountPercentage', 0)
                        .order('discountPercentage', { ascending: false })
                        .order('id', { ascending: true })
                        .limit(limit);

                    if (error) {
                        return {
                            error: { status: error.code, data: error.message }
                        };
                    }

                    // products_view is a Postgres view: PG cannot express NOT
                    // NULL for view columns, so every generated column is
                    // `| null`. The view's underlying columns are NOT NULL —
                    // cast once here.
                    return { data: data as unknown as Product[] };
                } catch (err) {
                    return {
                        error: { status: 'CUSTOM_ERROR', data: getErrorMessage(err) }
                    };
                }
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((product) => ({ type: 'Product' as const, id: product.id })),
                        { type: 'Product', id: 'DEALS' },
                    ]
                    : [{ type: 'Product', id: 'DEALS' }],
        }),

        checkPurchaseStatus: builder.query<string | null, number>({
            async queryFn(productId) {
                try {
                    const { data, error } = await supabase.rpc('get_last_purchase_date', { p_product_id: productId });
                    if (error) throw error;
                    // The generator infers a non-null Returns type, but the
                    // function explicitly RETURNs NULL for guests, already-
                    // reviewed products, and products with no purchase.
                    return { data: data as string | null };
                } catch (error) {
                    return { error: { status: 'CUSTOM_ERROR', data: getErrorMessage(error) } };
                }
            },
            providesTags: ['PurchaseHistory']
        })
    }),
});

export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useGetCategoriesQuery,
    useGetProductArrayByIdQuery,
    useGetSizesQuery,
    useCheckPurchaseStatusQuery,
    useGetDealsProductsQuery,
} = productsApi;