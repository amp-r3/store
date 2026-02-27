import { FC } from 'react';
import { Drawer } from 'vaul';
import { SortControlProps } from '../SortControl';
import { SortOptionsList } from '../SortOptionsList/SortOptionsList';
import style from './sort-bottom-sheet.module.scss';

export interface SortBottomSheetProps extends SortControlProps {
    isOpen: boolean;
}

export const SortBottomSheet: FC<SortBottomSheetProps> = ({
    sortingOptions,
    activeSortOption,
    changeSort,
    onClose,
    isOpen,
}) => {
    return (
        <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <Drawer.Portal>
                <Drawer.Overlay className={style['sort-bottom-sheet__backdrop']} />

                <Drawer.Content className={style['sort-bottom-sheet']}>
                    <div className={style['sort-bottom-sheet__drag-handle']} />

                    <div className={style['sort-bottom-sheet__header']}>
                        <Drawer.Title className={style['sort-bottom-sheet__title']}>
                            Sort by
                        </Drawer.Title>
                        <button
                            className={style['sort-bottom-sheet__close']}
                            type="button"
                            onClick={onClose}
                            aria-label="Close sort options"
                        >
                            ✕
                        </button>
                    </div>

                    <div className={style['sort-bottom-sheet__content']}>
                        <SortOptionsList
                            sortingOptions={sortingOptions}
                            activeSortOption={activeSortOption}
                            changeSort={changeSort}
                        />
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
};