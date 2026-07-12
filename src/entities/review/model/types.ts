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
    isLiked: boolean;
    isEdited: boolean;

    author?: {
        name: string;
        avatarUrl: string;
    };
}
