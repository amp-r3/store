import { FC, useEffect, useRef } from 'react';
import { IoClose } from 'react-icons/io5';
import { ICategoryProps } from '../CategoryControl';
import { CategoryList } from '../CategoryList/CategoryList';
import style from './category-popup.module.scss';

export const CategoryPopup: FC<ICategoryProps> = ({
    categoryOptions,
    activeCategoryOption,
    changeCategory,
    onClose,
}) => {
    const windowRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        windowRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className={style['category-popup']} role="dialog" aria-label="Select category" aria-modal="true">
            <div
                className={style['category-popup__backdrop']}
                onClick={onClose}
                aria-hidden="true"
            />
            <div ref={windowRef} className={style['category-popup__window']} tabIndex={-1}>
                <div className={style['category-popup__header']}>
                    <span className={style['category-popup__title']}>Category</span>
                    <button
                        type="button"
                        className={style['category-popup__close']}
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <IoClose aria-hidden="true" />
                    </button>
                </div>
                <div className={style['category-popup__body']}>
                    <CategoryList
                        categoryOptions={categoryOptions}
                        activeCategoryOption={activeCategoryOption}
                        changeCategory={changeCategory}
                    />
                </div>
            </div>
        </div>
    );
};