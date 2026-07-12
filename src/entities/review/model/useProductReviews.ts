import { useMemo } from 'react';
import { ProductReview } from '@/entities/review/model/types';
import { useAppSelector } from "@/shared/model";

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
