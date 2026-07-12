export interface Product {
    id: number;
    title: string;
    description: string;
    category: string;
    basePrice: number;
    price: number;
    discountPercentage: number;
    rating: number;
    tags: string[];
    brand: string;
    sku: string;
    weight: number;
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
    warrantyInformation: string;
    shippingInformation: string;
    availabilityStatus: string;
    returnPolicy: string;
    reviewsCount: number;
    minimumOrderQuantity: number;
    meta: {
        createdAt: string;
        updatedAt: string;
        barcode: string;
        qrCode: string;
    };
    thumbnail: string;
    images: string[];
}

export interface ProductSize {
    id: number;
    value: string;
    stock: number;
}

export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface ProductStateType {
    products: Record<number, Product>;
    total: number;
    status: LoadingStatus;
    error: string | null;
}
