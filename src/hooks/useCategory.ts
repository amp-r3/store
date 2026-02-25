import { useSearchParams } from "react-router";
import { categoryOptions, CategoryId } from "@/utils";

export function useCategory() {
    const [searchParams, setSearchParams] = useSearchParams();

    const currentCategory = searchParams.get('category') as CategoryId | null;
    const activeCategoryOption = categoryOptions.find(opt => opt.id === currentCategory) || null;

    const changeCategory = (newCategory: CategoryId | null) => {
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);

            if (newCategory) {
                newParams.set('category', newCategory);
            } else {
                newParams.delete('category');
            }

            newParams.delete('page');

            return newParams;
        }, { replace: true });
    };

    return {
        currentCategory,
        activeCategoryOption,
        changeCategory,
        categoryOptions
    };
}