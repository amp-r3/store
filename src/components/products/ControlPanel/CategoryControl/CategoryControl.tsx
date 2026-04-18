import { FC } from 'react';
// Components
import { CategoryOverlay } from './CategoryOverlay/CategoryOverlay';
import { CategoryPopup } from './CategoryPopup/CategoryPopup';
// Hooks
import { useMediaQuery } from '@/hooks';
// Types
import { Categories, Category } from '@/services/productsApi';

export interface ICategoryProps {
    categoryOptions: Categories;
    activeCategoryOption: Category | null;
    changeCategory: (newCategory: string) => void;
    isOpen: boolean;
    onClose: () => void
}

export const CategoryControl: FC<ICategoryProps> = (props) => {
    const isMobile = useMediaQuery('(max-width: 549px)');


    if (isMobile) {
        return <CategoryOverlay {...props} />;
    }

    return <CategoryPopup {...props} />;
};