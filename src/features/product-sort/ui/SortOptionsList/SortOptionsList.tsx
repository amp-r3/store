import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { SortingOption } from '@/entities/product';
import style from './sort-options-list.module.scss';

interface SortOptionsListProps {
  sortingOptions: SortingOption[];
  activeSortOption: SortingOption;
  changeSort: (newSortBy: string | null, newOrder: string | null) => void;
}

export const SortOptionsList = forwardRef<HTMLUListElement, SortOptionsListProps>(
  ({ sortingOptions, activeSortOption, changeSort }, ref) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleSelect = useCallback(
      (newSortBy: string | null, newOrder: string | null) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          changeSort(newSortBy, newOrder);
        }, 150);
      },
      [changeSort],
    );

    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    if (sortingOptions.length === 0) {
      return <p className={style['sort-options-list__empty']}>No sort options available.</p>;
    }

    return (
      <ul className={style['sort-options-list']} aria-label="Sort options" ref={ref}>
        {sortingOptions.map((option) => {
          const isActive = option.id === activeSortOption?.id;
          const Icon = option.icon;

          return (
            <li key={option.id}>
              <button
                className={`${style['sort-options-list__item']} ${
                  isActive ? style['sort-options-list__item--active'] : ''
                }`}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleSelect(option.sortBy, option.order)}
              >
                <div className={style['sort-options-list__item-content']}>
                  {Icon && (
                    <Icon className={style['sort-options-list__item-icon']} aria-hidden="true" />
                  )}
                  <span className={style['sort-options-list__item-label']}>{option.label}</span>
                </div>
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
  },
);

SortOptionsList.displayName = 'SortOptionsList';
