import { skipToken } from "@reduxjs/toolkit/query";
import { useGetProductByIdQuery } from '../api/productsApi';

export function useProduct(id: string | undefined) {
    const {
        data: product,
        isLoading,
        isError,
        error
    } = useGetProductByIdQuery(id ? Number(id) : skipToken)

    const isNotFound = isError || (!isLoading && !product);

    return { product, isLoading, isNotFound, error };
}