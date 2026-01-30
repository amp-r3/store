import { FC, useState } from 'react';
// Icons
import { IoSwapVertical, IoChevronDown } from 'react-icons/io5';
// Custom hooks
import { useMediaQuery } from '@/hooks';
// Style
import style from './sortPanel.module.scss';
// Types
import { SortingOption } from '../../../utils/sortingOptions';

interface SortPanelProps {
  changeSort: (newSortBy: string) => void;
  sortingOptions: SortingOption[];
  activeSortOption: SortingOption;
}


export const SortPanel: FC<SortPanelProps> = ({ changeSort, sortingOptions, activeSortOption }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobileAccordion = useMediaQuery('(max-width: 550px)');

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const headerContent = (
    <>
      <IoSwapVertical className={style.sort_panel__icon} />
      <span className={style.sort_panel__label}>
        Sort: {activeSortOption.label}
      </span>
      {isMobileAccordion && (
        <IoChevronDown
          className={`${style.sort_panel__chevron} ${isExpanded ? style.expanded : ''}`}
          aria-hidden="true"
        />
      )}
    </>
  );

  return (
    <div className={style.sort_panel}>
      {isMobileAccordion ? (
        <button
          className={style.sort_panel__header}
          onClick={handleToggle}
          aria-expanded={isExpanded}
        >
          {headerContent}
        </button>
      ) : (
        <div className={style.sort_panel__header}>
          {headerContent}
        </div>
      )}

      <div className={`${style.sort_panel__options} ${isMobileAccordion && isExpanded ? style.expanded : ''}`}>
        <div>
          {sortingOptions.map((option) => (
            <button
              key={option.id}
              className={`${style.sort_panel__button} ${option.id === activeSortOption.id ? style.sort_panel__button__active : ''
                }`}
              onClick={() => changeSort(option.id)}
            >
              {option.icon && (
                <span className={style.sort_panel__button_icon}>
                  <option.icon />
                </span>
              )}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};