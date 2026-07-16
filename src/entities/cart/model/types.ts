import { Product } from '@/entities/product';

export interface CartItemDetails extends Product {
    sizeId: number;
    quantity: number;
}

export interface CartData {
    productId: number;
    quantity: number;
}
