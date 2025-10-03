import axios from "axios";

const apiClient = axios.create({
    baseURL: 'https://dummyjson.com'
});

export const fetchProducts = (params) => {
    const { page, sortBy, order } = params;
    const limit = 12;
    const skip = (page - 1) * limit;

    let url = `/products?limit=${limit}&skip=${skip}`;

    if (sortBy && order) {
        url += `&sortBy=${sortBy}&order=${order}`;
    }

    return apiClient.get(url);
}

export const fetchProductsById = (product) => {
    return apiClient.get(`/products/${product}`);
}

export const searchProducts = (query) => {
    return apiClient.get(`/products/search?q=${query}`);
}