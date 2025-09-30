import axios from "axios";

const apiClient = axios.create({
    baseURL: 'https://dummyjson.com'
});

export const fetchProducts = (limit) => {
    return apiClient.get(`/products?limit=${limit}`)
}