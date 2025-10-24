import { getProductsById } from "@/features/products/store/productsSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export function useProduct(id) {
    const { products, status } = useSelector((state) => state.products);
    const dispatch = useDispatch();

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