import { FC } from 'react';
import { IoClose } from 'react-icons/io5';
import { ICategoryProps } from '../CategoryControl';
import { CategoryList } from '../CategoryList/CategoryList';
import style from './category-popup.module.scss';
import { Dialog } from 'radix-ui';


export const CategoryPopup: FC<ICategoryProps> = ({
    categoryOptions,
    activeCategoryOption,
    changeCategory,
    isOpen,
    onClose,
}) => {


    const handleChangeCategory = (newCategory: string | null) => {
        changeCategory(newCategory);
        onClose()
    };


    return (
        <Dialog.Root
            open={isOpen}
            onOpenChange={(open) => !open && onClose()}
        >
            <Dialog.Portal container={document.getElementById('modal-root')!}>
                <Dialog.Overlay
                    
                    className={style['category-popup__backdrop']}
                />
                <Dialog.Content className={style['category-popup__window']}>
                    <div className={style['category-popup__header']}>
                        <Dialog.Title className={style['category-popup__title']}>Category</Dialog.Title>
                        <Dialog.Close asChild>
                            <button
                                type="button"
                                className={style['category-popup__close']}
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <IoClose aria-hidden="true" />
                            </button>
                        </Dialog.Close>
                    </div>
                    <div className={style['category-popup__body']}>
                        <CategoryList
                            categoryOptions={categoryOptions}
                            activeCategoryOption={activeCategoryOption}
                            changeCategory={handleChangeCategory}
                        />
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};