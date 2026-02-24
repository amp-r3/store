import { FC } from 'react';
// Style
import style from './sort-control.module.scss';
// Types
import { SortingOption } from '@/utils/sortingOptions';

interface SortControlProps {
  sortingOptions: SortingOption[];
  activeSortOption: SortingOption;
  changeSort: (newSortBy: string) => void;
  isMobileAccordion: boolean;
  isExpanded: boolean;
  onClose: () => void;
}

export const SortControl: FC<SortControlProps> = ({
  sortingOptions,
  activeSortOption,
  changeSort,
  isMobileAccordion,
  isExpanded,
  onClose,
}) => {
  const wrapperClasses = [
    isMobileAccordion ? style['sort-control__wrapper'] : '',
    isMobileAccordion && isExpanded ? style['sort-control__wrapper--expanded'] : ''
  ].filter(Boolean).join(' ');

  const containerClasses = [
    style['sort-control__container'],
    isMobileAccordion && isExpanded ? style['sort-control__container--expanded'] : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={wrapperClasses || undefined}
      inert={isMobileAccordion && !isExpanded ? true : undefined}
    >
      <div className={containerClasses}>
        <div className={style['sort-control__list']}>
          {sortingOptions.map((option) => {
            const isActive = option.id === activeSortOption.id;
            const buttonClasses = [
              style['sort-control__button'],
              isActive ? style['sort-control__button--active'] : ''
            ].filter(Boolean).join(' ');

            return (
              <button
                key={option.id}
                className={buttonClasses}
                onClick={() => {
                  changeSort(option.id);
                  if (isMobileAccordion) onClose();
                }}
              >
                {option.icon && (
                  <span className={style['sort-control__icon']}>
                    <option.icon />
                  </span>
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};