import { FC, useCallback, useEffect, useRef } from 'react';
import { CategoryOption } from '@/utils/categoryOptions';
import style from './category-list.module.scss';

interface CategoryListProps {
    categoryOptions: CategoryOption[];
    activeCategoryOption: CategoryOption | null;
    changeCategory: (newCategory: string | null) => void;
    onClose?: ()=> void;
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
                if(onClose) {
                    onClose()
                }
                changeCategory(newCategory);
            }, 150);
        },
        [changeCategory]
    );

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return (
        <ul className={style['category-list']}>
            {categoryOptions.map((option) => {
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