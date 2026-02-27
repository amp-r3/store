import { FC, useState, useRef, useEffect } from 'react';
import { IoSwapVertical, IoGrid } from 'react-icons/io5';
import style from './control-panel.module.scss';
import { SortingOption } from '@/utils/sortingOptions';
import { CategoryOption } from '@/utils/categoryOptions';
import { SortControl } from './SortControl/SortControl';

interface ControlPanelProps {
  changeSort: (newSortBy: string) => void;
  sortingOptions: SortingOption[];
  activeSortOption: SortingOption;
  changeCategory: (category: string | null) => void;
  categoryOptions: CategoryOption[];
  activeCategoryOption: CategoryOption | null;
}

export const ControlPanel: FC<ControlPanelProps> = ({
  changeSort,
  sortingOptions,
  activeSortOption,
  changeCategory,
  categoryOptions,
  activeCategoryOption,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        !target.closest('[role="dialog"]')
      ) {
        setIsSortOpen(false);
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSort = () => {
    setIsSortOpen((prev) => !prev);
    setIsCategoryOpen(false);
  };

  const handleToggleCategory = () => {
    setIsCategoryOpen((prev) => !prev);
    setIsSortOpen(false);
  };

  const handleSortChange = (newSortBy: string) => {
    changeSort(newSortBy);
    setIsSortOpen(false);
  };

  const handleCategoryChange = (newCategory: string | null) => {
    changeCategory(newCategory);
    setIsCategoryOpen(false);
  };

  return (
    <div className={style['control-panel']} ref={panelRef}>
      <div className={style['control-panel__group']}>
        <button
          ref={sortBtnRef}
          className={style['control-panel__btn']}
          type="button"
          onClick={handleToggleSort}
          aria-expanded={isSortOpen}
          aria-label={`Sort by: ${activeSortOption?.label}`}
        >
          <IoSwapVertical className={style['control-panel__btn-icon']} aria-hidden="true" />
          <span className={style['control-panel__btn-label']}>Sort</span>
          <span className={style['control-panel__btn-value']}>{activeSortOption?.label}</span>
        </button>

        <button
          className={style['control-panel__btn']}
          type="button"
          onClick={handleToggleCategory}
          aria-expanded={isCategoryOpen}
          aria-label={`Category: ${activeCategoryOption?.label || 'All'}`}
        >
          <IoGrid className={style['control-panel__btn-icon']} aria-hidden="true" />
          <span className={style['control-panel__btn-label']}>Category</span>
          <span className={style['control-panel__btn-value']}>
            {activeCategoryOption?.label || 'All'}
          </span>
        </button>
      </div>

      <SortControl
        isOpen={isSortOpen}
        sortingOptions={sortingOptions}
        activeSortOption={activeSortOption}
        triggerRef={sortBtnRef}
        changeSort={handleSortChange}
        onClose={() => setIsSortOpen(false)}
      />
      {/* {isCategoryOpen && (
        <CategoryControl 
          categoryOptions={categoryOptions}
          activeCategoryOption={activeCategoryOption}
          changeCategory={handleCategoryChange}
          onClose={() => setIsCategoryOpen(false)}
        />
      )} */}
    </div>
  );
};