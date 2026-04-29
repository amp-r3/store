import { supabase } from "@/supabase";
import { Product } from "@/types/products";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Category {
    slug: string;
    name: string;
    url?: string;
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

                    if (error) throw error;

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
                } catch (error: any) {
                    return { error: { status: 'CUSTOM_ERROR', error: error.message } };
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

                    if (error) throw error;

                    const defaultCategory: Category = {
                        slug: 'all',
                        name: 'All Products',
                    };

                    return { data: [defaultCategory, ...(data as Category[])] };
                } catch (error: any) {
                    return { error: { status: 'CUSTOM_ERROR', error: error.message } };
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

                    if (error) throw error;

                    return { data: data as Product };
                } catch (error: any) {
                    return { error: { status: 'CUSTOM_ERROR', error: error.message } };
                }
            },
            providesTags: (result, error, id) => [{ type: 'Product', id }],
        }),

        getProductArrayById: builder.query<Product[], number[]>({
            async queryFn(ids) {
                try {
                    const { data, error } = await supabase
                        .from('products_view')
                        .select('*')
                        .in('id', ids);

                    if (error) throw error;

                    return { data: data as Product[] };
                } catch (error: any) {
                    return { error: { status: 'CUSTOM_ERROR', error: error.message } };
                }
            }
        })
    }),
});

export const { 
    useGetProductsQuery, 
    useGetProductByIdQuery, 
    useGetCategoriesQuery, 
    useGetProductArrayByIdQuery 
} = productsApi;