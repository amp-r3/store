export interface Product {
    id: number;
    title: string;
    description: string;
    category: string;
    basePrice: number;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
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

    sizes: string[];
    colors: ProductColor[];
}

export interface ProductReview {
    id: number;
    productId: number;
    rating: number;
    comment: string | null;
    date: string;
    helpfulCount: number;

    reviewerName: string | null;
    reviewerEmail: string | null;

    userId: string | null;

    author?: {
        name: string;
        avatarUrl?: string;
    };

}

export interface ProductColor {
    name: string;
    hex: string;
}

export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface ProductStateType {
    products: Record<number, Product>;
    total: number;
    status: LoadingStatus;
    error: string | null;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface CartData {
    quantity: number;
}