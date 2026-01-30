import axios from "axios";

const apiClient = axios.create({
    baseURL: 'https://dummyjson.com'
});

export interface ProductParams {
    page?: number;
    sortBy?: string | null;
    order?: string | null;
    search?: string | null;
}

export const getProducts = (params: ProductParams) => {
    const { page, sortBy, order, search } = params;
    const limit = 12;
    const skip = (page - 1) * limit;

    const endpoint = search ? '/products/search' : '/products';

    const queryParams = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString()
    });

    if (search) {
        queryParams.append('q', search);
    }

    if (sortBy && order) {
        queryParams.append('sortBy', sortBy);
        queryParams.append('order', order);
    }

    return apiClient.get(`${endpoint}?${queryParams.toString()}`);
}

export const getProductById = (id: string) => {
    return apiClient.get(`/products/${id}`);
}