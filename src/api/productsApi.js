import axios from "axios";

const apiClient = axios.create({
    baseURL: 'https://dummyjson.com'
});

export const fetchProducts = (page) => {
    const limit = 12;
    const skip = (page - 1) * limit;
    return apiClient.get(`/products?limit=${limit}&skip=${skip}`)
}