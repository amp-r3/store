import { Product } from "@/types/products";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Category {
    slug: string;
    name: string;
    url: string;
}
export type Categories = Category[]

export interface ProductParams {
    page?: number;
    sortBy?: string | null;
    order?: string | null;
    search?: string | null;
    category?: string | null;
}

export interface ProductsResponse {
    items: Record<string, Product>;
    ids: number[];
    total: number;
}

export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com' }),
    endpoints: (builder) => ({
        getProducts: builder.query<ProductsResponse, ProductParams>({
            query: (params) => {
                const { page = 1, search, sortBy, order, category } = params;
                const limit = 12;
                const skip = (page - 1) * limit;

                let url = 'products';
                if (search) {
                    url = 'products/search';
                } else if (category) {
                    url = `products/category/${category}`;
                }

                const queryParams: Record<string, any> = {
                    limit,
                    skip,
                };

                if (search) {
                    queryParams.q = search;
                }

                if (sortBy && order) {
                    queryParams.sortBy = sortBy;
                    queryParams.order = order;
                }

                return {
                    url,
                    params: queryParams,
                };
            },
            transformResponse: (response: { products: Product[], total: number }) => {
                const items = response.products.reduce((acc, curr) => {
                    acc[curr.id] = curr;
                    return acc;
                }, {} as Record<string, Product>);

                const ids = response.products.map((product) => product.id);

                return {
                    items,
                    ids,
                    total: response.total
                };
            },
        }),
        
        getCategories: builder.query<Categories, void>({
            query: () => 'products/categories',
            
            transformResponse: (response: Categories) => {
                const defaultCategory: Category = {
                    slug: 'all',
                    name: 'All Products',
                    url: '',
                };
                return [defaultCategory, ...response];
            },
        }),

        getProductById: builder.query<Product, string>({
            query: (id) => `products/${id}`,
        }),
    }),
});

export const { useGetProductsQuery, useGetProductByIdQuery, useGetCategoriesQuery } = productsApi;