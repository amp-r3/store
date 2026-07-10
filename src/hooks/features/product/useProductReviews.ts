import { useMemo } from 'react';
import { useAppSelector } from '@/hooks';
import { ProductReview } from '@/types/products';

export const useProductReviews = (reviews: ProductReview[]) => {
    const user = useAppSelector((state) => state.auth.user);

    const sortedReviews = useMemo(() => {
        if (!reviews) return [];
        
        const reviewsCopy = [...reviews];
        
        if (user?.id) {
            reviewsCopy.sort((a, b) => {
                if (a.userId === user.id && b.userId !== user.id) return -1;
                if (b.userId === user.id && a.userId !== user.id) return 1;
                return 0;
            });
        }
        
        return reviewsCopy;
    }, [reviews, user?.id]);

    return { sortedReviews, user };
};
