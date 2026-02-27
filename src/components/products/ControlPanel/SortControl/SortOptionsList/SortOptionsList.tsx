import { FC, forwardRef, useCallback, useRef } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { SortingOption } from '@/utils/sortingOptions';
import style from './sort-options-list.module.scss';

interface SortOptionsListProps {
  sortingOptions: SortingOption[];
  activeSortOption: SortingOption;
  changeSort: (newSortBy: string) => void;
}

export const SortOptionsList = forwardRef<HTMLUListElement, SortOptionsListProps>(
  ({ sortingOptions, activeSortOption, changeSort }, ref) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSelect = useCallback(
      (id: string) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          changeSort(id);
        }, 150);
      },
      [changeSort]
    );

    return (
      <ul
        className={style['sort-options-list']}
        role="listbox"
        aria-label="Sort options"
        ref={ref}
      >
        {sortingOptions.map((option) => {
          const isActive = option.id === activeSortOption?.id;
          const Icon = option.icon;

          return (
            <li key={option.id} role="option" aria-selected={isActive}>
              <button
                className={`${style['sort-options-list__item']} ${
                  isActive ? style['sort-options-list__item--active'] : ''
                }`}
                type="button"
                onClick={() => handleSelect(option.id)}
              >
                {Icon && (
                  <Icon
                    className={style['sort-options-list__item-icon']}
                    aria-hidden="true"
                  />
                )}
                <span className={style['sort-options-list__item-label']}>
                  {option.label}
                </span>
                {isActive && (
                  <IoCheckmark
                    className={style['sort-options-list__item-check']}
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }
);

SortOptionsList.displayName = 'SortOptionsList';