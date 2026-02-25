import { FC, useState } from 'react';
// Icons
import { IoSwapVertical, IoChevronDown } from 'react-icons/io5';
// Custom hooks
import { useMediaQuery } from '@/hooks';
// Components
import { SortControl } from './SortControl/SortControl';
// Style
import style from './control-panel.module.scss';
// Types
import { SortingOption } from '@/utils/sortingOptions';
import { CategoryOption } from '@/utils/categoryOptions';
import { CategoryControl } from './CategoryControl/CategoryControl';

interface ControlPanelProps {
  changeSort: (newSortBy: string) => void;
  sortingOptions: SortingOption[];
  activeSortOption: SortingOption;
  changeCategory: (category: string) => void;
  categoryOptions: CategoryOption[];
  activeCategoryOption: CategoryOption;
}

export const ControlPanel: FC<ControlPanelProps> = ({ changeSort, sortingOptions, activeSortOption, changeCategory, categoryOptions, activeCategoryOption }) => {
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
          type="button"
        >
          {headerContent}
        </button>
      ) : (
        <div className={style.sort_panel__header}>
          {headerContent}
        </div>
      )}
      <div className={style.sort_panel__wrapper}>
        <SortControl
          sortingOptions={sortingOptions}
          activeSortOption={activeSortOption}
          changeSort={changeSort}
          isMobileAccordion={isMobileAccordion}
          isExpanded={isExpanded}
          onClose={() => setIsExpanded(false)}
        />
        <CategoryControl
          categoryOptions={categoryOptions}
          activeCategoryOption={activeCategoryOption}
          changeCategory={changeCategory}
          isMobileAccordion={isMobileAccordion}
          isExpanded={isExpanded}
          onClose={() => setIsExpanded(false)}
        />
      </div>
    </div>
  );
};