import { FC, useCallback, useEffect, useRef, useMemo } from 'react';
import { CategoryOption } from '@/utils/categoryOptions';
import style from './category-list.module.scss';

interface CategoryListProps {
    categoryOptions: CategoryOption[];
    activeCategoryOption: CategoryOption | null;
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
            if (a.id === DEFAULT_CATEGORY_ID) return -1;
            if (b.id === DEFAULT_CATEGORY_ID) return 1;
            if (activeCategoryOption) {
                if (a.id === activeCategoryOption.id) return -1;
                if (b.id === activeCategoryOption.id) return 1;
            }
            return 0;
        });
    }, [categoryOptions, activeCategoryOption]);

    return (
        <ul className={style['category-list']}>
            {sortedOptions.map((option) => {
                const isActive = option.id === activeCategoryOption?.id;

                return (
                    <li key={option.id}>
                        <button
                            type="button"
                            className={`${style['category-list__item']} ${isActive ? style['category-list__item--active'] : ''}`}
                            onClick={() => handleSelect(option.id)}
                            aria-pressed={isActive}
                        >
                            {option.label}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
};