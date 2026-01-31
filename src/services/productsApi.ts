import { Product } from "@/types/products";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface ProductParams {
    page?: number;
    sortBy?: string | null;
    order?: string | null;
    search?: string | null;
}

export interface ProductsResponse {
    items: Record<string, Product>;
    total: number;
}

export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com' }),
    endpoints: (builder) => ({
        getProducts: builder.query<ProductsResponse, ProductParams>({
            query: (params) => {
                const { page = 1, sortBy, order, search } = params;
                const limit = 12;
                const skip = (page - 1) * limit;

                const url = search ? 'products/search' : 'products';
                const queryParams: Record<string, any> = {
                    limit,
                    skip,
                };

                if (search) {
                    queryParams.q = search
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
                return {
                    items: response.products.reduce((acc, curr) => {
                        const map: Record<string, Product> = acc;
                        map[curr.id] = curr;
                        return map;
                    }, {} as Record<string, Product>),
                    total: response.total
                };
            },
        }),

        getProductById: builder.query<Product, string>({
            query: (id) => `products/${id}`,
        }),
    }),
});

export const { useGetProductsQuery, useGetProductByIdQuery } = productsApi