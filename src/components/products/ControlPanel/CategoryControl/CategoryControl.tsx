import { FC } from 'react';
// Style
import style from './category-control.module.scss';
// Types
import { CategoryOption } from '@/utils/categoryOptions';

interface CategoryControlProps {
    categoryOptions: CategoryOption[];
    activeCategoryOption: CategoryOption | null;
    changeCategory: (category: string | null) => void;
    isMobileAccordion: boolean;
    isExpanded: boolean;
    onClose: () => void;
}

export const CategoryControl: FC<CategoryControlProps> = ({
    categoryOptions,
    activeCategoryOption,
    changeCategory,
    isMobileAccordion,
    isExpanded,
    onClose,
}) => {
    const wrapperClasses = [
        isMobileAccordion ? style['category-control__wrapper'] : '',
        isMobileAccordion && isExpanded ? style['category-control__wrapper--expanded'] : '',
    ].filter(Boolean).join(' ');

    const containerClasses = [
        style['category-control__container'],
        isMobileAccordion && isExpanded ? style['category-control__container--expanded'] : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            className={wrapperClasses || undefined}
            inert={isMobileAccordion && !isExpanded ? true : undefined}
        >
            <div className={containerClasses}>
                <div className={style['category-control__list']}>
                    {categoryOptions.map((option) => {
                        const isActive = option.id === activeCategoryOption?.id;
                        const buttonClasses = [
                            style['category-control__button'],
                            isActive ? style['category-control__button--active'] : '',
                        ].filter(Boolean).join(' ');
                        const handleChange = () => {
                            if (option.id === activeCategoryOption?.id) {
                                changeCategory(null);
                                return;
                            }

                            changeCategory(option.id);
                        }

                        return (
                            <button
                                key={option.id}
                                type="button"
                                className={buttonClasses}
                                onClick={handleChange}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};