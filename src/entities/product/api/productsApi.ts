import { supabase, baseApi } from "@/shared/api";
import { Product, ProductSize } from "@/entities/product/model/types";
import { getErrorMessage } from "@/shared/lib";
import {
    fetchProducts,
    fetchCategories,
    fetchProductById,
    fetchProductArrayById,
    fetchSizes,
    fetchDealsProducts,
    type Categories,
    type ProductParams,
    type ProductsResponse,
} from './queries';

// fetch* (queries.ts) throw the raw PostgrestError/Error on failure — this
// maps that back into RTK Query's `{ error: { status, data } }` shape, same
// as the inline try/catch each queryFn used to have.
function toQueryError(err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && 'message' in err) {
        const pgError = err as { code: string; message: string };
        return { error: { status: pgError.code, data: pgError.message } };
    }
    return { error: { status: 'CUSTOM_ERROR' as const, data: getErrorMessage(err) } };
}

export const productsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({

        getProducts: builder.query<ProductsResponse, ProductParams>({
            async queryFn(params) {
                try {
                    return { data: await fetchProducts(supabase, params) };
                } catch (err) {
                    return toQueryError(err);
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
                    return { data: await fetchCategories(supabase) };
                } catch (err) {
                    return toQueryError(err);
                }
            },
            providesTags: [{ type: 'Category', id: 'LIST' }]
        }),

        getProductById: builder.query<Product, number>({
            async queryFn(id) {
                try {
                    return { data: await fetchProductById(supabase, id) };
                } catch (err) {
                    return toQueryError(err);
                }
            },
            providesTags: (_, __, id) => [{ type: 'Product', id }],
        }),

        getProductArrayById: builder.query<Product[], number[]>({
            async queryFn(ids) {
                try {
                    return { data: await fetchProductArrayById(supabase, ids) };
                } catch (err) {
                    return toQueryError(err);
                }
            }
        }),

        getSizes: builder.query<ProductSize[], number>({
            async queryFn(id) {
                try {
                    return { data: await fetchSizes(supabase, id) };
                } catch (err) {
                    return toQueryError(err);
                }
            },
            providesTags: (_result, _error, productId) => [{ type: 'Size', id: productId }]
        }),

        getDealsProducts: builder.query<Product[], { limit?: number } | void>({
            async queryFn(params) {
                try {
                    return { data: await fetchDealsProducts(supabase, params ?? undefined) };
                } catch (err) {
                    return toQueryError(err);
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
