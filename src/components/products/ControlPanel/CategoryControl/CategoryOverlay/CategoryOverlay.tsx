import { FC } from 'react';
import { Drawer } from 'vaul';
import { IoClose } from 'react-icons/io5';
import { ICategoryProps } from '../CategoryControl';
import { CategoryList } from '../CategoryList/CategoryList';
import style from './category-overlay.module.scss';

export const CategoryOverlay: FC<ICategoryProps> = ({
    categoryOptions,
    activeCategoryOption,
    changeCategory,
    isOpen,
    onClose,
}) => {
    return (
        <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Drawer.Portal>
                <Drawer.Overlay className={style['category-overlay__backdrop']} />
                <Drawer.Content className={style['category-overlay__content']}>
                    <div className={style['category-overlay__handle']} />

                    <div className={style['category-overlay__header']}>
                        <Drawer.Title className={style['category-overlay__title']}>
                            Category
                        </Drawer.Title>
                        <button
                            type="button"
                            className={style['category-overlay__close']}
                            onClick={onClose}
                            aria-label="Close category options"
                        >
                            <IoClose aria-hidden="true" />
                        </button>
                    </div>

                    <div className={style['category-overlay__body']}>
                        <CategoryList
                            categoryOptions={categoryOptions}
                            activeCategoryOption={activeCategoryOption}
                            changeCategory={changeCategory}
                            onClose={onClose}
                        />
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};