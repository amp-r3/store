import { useGetProductByIdQuery } from "@/services/productsApi";
import { skipToken } from "@reduxjs/toolkit/query/react";

export function useProduct(id: string | undefined) {
    const {
        data: product,
        isLoading,
        isError,
        error
    } = useGetProductByIdQuery(id ?? skipToken);

    const isNotFound = isError || (!isLoading && !product);

    return { product, isLoading, isNotFound, error };
}