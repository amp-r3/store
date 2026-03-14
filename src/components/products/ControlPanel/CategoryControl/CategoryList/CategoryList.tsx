import { FC, useCallback, useEffect, useRef, useMemo } from 'react';
import style from './category-list.module.scss';
import { Categories, Category } from '@/services/productsApi';

interface CategoryListProps {
    categoryOptions: Categories;
    activeCategoryOption: Category | null;
    changeCategory: (newCategory: string | null) => void;
    onClose?: () => void;
}

export const CategoryList: FC<CategoryListProps> = ({
    categoryOptions,
    activeCategoryOption,
    changeCategory,
    onClose
}) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSelect = useCallback(
        (newCategory: string) => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                if (onClose) {
                    onClose();
                }
                changeCategory(newCategory);
            }, 150);
        },
        [changeCategory, onClose]
    );

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const sortedOptions = useMemo(() => {
        const DEFAULT_CATEGORY_ID = 'all';

        return [...categoryOptions].sort((a, b) => {
            if (a.slug === DEFAULT_CATEGORY_ID) return -1;
            if (b.slug === DEFAULT_CATEGORY_ID) return 1;
            if (activeCategoryOption) {
                if (a.slug === activeCategoryOption.slug) return -1;
                if (b.slug === activeCategoryOption.slug) return 1;
            }
            return 0;
        });
    }, [categoryOptions, activeCategoryOption]);

    return (
        <ul className={style['category-list']}>
            {sortedOptions.map((option) => {
                const isActive = option.slug === activeCategoryOption?.slug;

                return (
                    <li key={option.slug}>
                        <button
                            type="button"
                            className={`${style['category-list__item']} ${isActive ? style['category-list__item--active'] : ''}`}
                            onClick={() => handleSelect(option.slug)}
                            aria-pressed={isActive}
                        >
                            {option.name}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
};