import { FC } from 'react';
// Components
import { CategoryOverlay } from '../../../../widgets/control-panel/CategoryControl/CategoryOverlay/CategoryOverlay';
import { CategoryPopup } from '../../../../widgets/control-panel/CategoryControl/CategoryPopup/CategoryPopup';
// Hooks
// Types
import { Categories, Category } from '@/entities/product';
import { useMediaQuery } from "@/shared/lib/hooks";

export interface ICategoryProps {
    categoryOptions: Categories;
    activeCategoryOption: Category | null;
    changeCategory: (newCategory: string | null) => void;
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