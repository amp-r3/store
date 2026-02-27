import { FC } from 'react';
import { CategoryOption } from '@/utils/categoryOptions';
import style from './category-list.module.scss';

interface CategoryListProps {
    categoryOptions: CategoryOption[];
    activeCategoryOption: CategoryOption | null;
    changeCategory: (newCategory: string | null) => void;
}

export const CategoryList: FC<CategoryListProps> = ({
    categoryOptions,
    activeCategoryOption,
    changeCategory,
}) => {
    return (
        <ul className={style['category-list']}>
            {categoryOptions.map((option) => (
                <li key={option.id} className={style['category-list__item']}>
                    <button
                        type="button"
                        className={`${style['category-list__btn']} ${activeCategoryOption?.id === option.id
                                ? style['category-list__btn--active']
                                : ''
                            }`}
                        onClick={() => changeCategory(option.id)}
                        aria-pressed={activeCategoryOption?.id === option.id}
                    >
                        {option.label}
                    </button>
                </li>
            ))}
        </ul>
    );
};