import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { ICategoryProps } from '../CategoryControl';
import { CategoryList } from '../CategoryList/CategoryList';
import style from './category-popup.module.scss';

const CLOSE_ANIMATION_DURATION = 280;

export const CategoryPopup: FC<ICategoryProps> = ({
    categoryOptions,
    activeCategoryOption,
    changeCategory,
    onClose,
}) => {
    const windowRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        if (isClosing) return;
        setIsClosing(true);
        
        timerRef.current = setTimeout(() => {
            onClose();
        }, CLOSE_ANIMATION_DURATION);
    }, [isClosing, onClose]);

    const handleChangeCategory = useCallback((newCategory: string | null) => {
        changeCategory(newCategory);
        handleClose();
    }, [changeCategory, handleClose]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    useEffect(() => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        
        windowRef.current?.focus();

        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleClose]);

    return createPortal(
        <div
            className={`${style['category-popup']}${isClosing ? ` ${style['category-popup--closing']}` : ''}`}
            role="dialog"
            aria-label="Select category"
            aria-modal="true"
        >
            <div
                className={style['category-popup__backdrop']}
                onClick={handleClose}
                aria-hidden="true"
            />
            <div ref={windowRef} className={style['category-popup__window']} tabIndex={-1}>
                <div className={style['category-popup__header']}>
                    <span className={style['category-popup__title']}>Category</span>
                    <button
                        type="button"
                        className={style['category-popup__close']}
                        onClick={handleClose}
                        aria-label="Close"
                    >
                        <IoClose aria-hidden="true" />
                    </button>
                </div>
                <div className={style['category-popup__body']}>
                    <CategoryList
                        categoryOptions={categoryOptions}
                        activeCategoryOption={activeCategoryOption}
                        changeCategory={handleChangeCategory}
                    />
                </div>
            </div>
        </div>,
        document.body,
    );
};