import { FC } from 'react';
import { DropdownMenu } from 'radix-ui';
import { SortControlProps } from '../SortControl';
import { SortOptionsList } from '../SortOptionsList/SortOptionsList';
import style from './sort-dropdown.module.scss';

export const SortDropdown: FC<SortControlProps> = ({
    sortingOptions,
    activeSortOption,
    changeSort,
}) => {
    return (
        <DropdownMenu.Portal container={document.getElementById('modal-root')!}>
            <DropdownMenu.Content
                className={style['sort-dropdown']}
                sideOffset={8}
                align="start"
            >
                <SortOptionsList
                    sortingOptions={sortingOptions}
                    activeSortOption={activeSortOption}
                    changeSort={changeSort}
                />
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    );
};