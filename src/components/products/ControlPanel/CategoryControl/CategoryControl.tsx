import { FC } from 'react';
// Components
import { CategoryOverlay } from './CategoryOverlay/CategoryOverlay';
import { CategoryPopup } from './CategoryPopup/CategoryPopup';
// Hooks
import { useMediaQuery } from '@/hooks';
// Types
import { CategoryOption } from '@/utils/categoryOptions';

export interface ICategoryProps {
    categoryOptions: CategoryOption[];
    activeCategoryOption: CategoryOption | null;
    changeCategory: (newCategory: string) => void;
    isOpen: boolean;
    onClose: () => void
}

export const CategoryControl: FC<ICategoryProps> = (props) => {
    const isMobile = useMediaQuery('(max-width: 549px)');

    if (!isMobile && !props.isOpen) return null;

    if (isMobile) {
        return <CategoryOverlay {...props} />;
    }

    return <CategoryPopup {...props} />;
};