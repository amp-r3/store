import { getProductsById } from "@/features/products/store/productsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hook";
import { useEffect } from "react";

export function useProduct(id: string) {
    const { products, status } = useAppSelector((state) => state.products);
    const dispatch = useAppDispatch();
    

    const product = products[Number(id)]
    console.log(product);
    console.log(products);


    useEffect(() => {
        if (product) {
            console.log("product already exist");
            return;
        }
        if (!product && status !== 'loading') {
            dispatch(getProductsById(id));
            console.log("dispatch product");
        }
    }, [product, status, dispatch, id]);
    
    const isNotFound = status === 'succeeded' && !product

    return { product, status, isNotFound }

}