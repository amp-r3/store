import { getProductsById } from "@/features/products/store/productsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useEffect } from "react";

export function useProduct(id: string) {
    const { products, status } = useAppSelector((state) => state.products);
    const dispatch = useAppDispatch();

    const product = products[id]

    useEffect(() => {
        if (product) {
            return;
        }
        if (!product && status !== 'loading') {
            dispatch(getProductsById(id));
        }
    }, [product, status, dispatch, id]);
    
    const isNotFound = status === 'succeeded' && !product

    return { product, status, isNotFound }

}