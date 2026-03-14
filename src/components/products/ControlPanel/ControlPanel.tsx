import { FC, useState, useRef, useEffect } from 'react';
import { IoSwapVertical, IoGrid } from 'react-icons/io5';
import style from './control-panel.module.scss';
import { SortingOption } from '@/utils/sortingOptions';
import { SortControl } from './SortControl/SortControl';
import { CategoryControl } from './CategoryControl/CategoryControl';
import { useHaptics } from '@/hooks';
import { Categories, Category } from '@/services/productsApi';

interface ControlPanelProps {
  clearAll: ()=> void
  changeSort: (newSortBy: string, newOrder: string) => void;
  sortingOptions: SortingOption[];
  activeSortOption: SortingOption;
  changeCategory: (category: string | null) => void;
  categoryOptions: Categories;
  activeCategoryOption: Category | null;
  searchQuery: string | null;
}

export const ControlPanel: FC<ControlPanelProps> = ({
  changeSort,
  sortingOptions,
  activeSortOption,
  changeCategory,
  categoryOptions,
  activeCategoryOption,
  searchQuery,
  clearAll
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  
  const isFilter = activeCategoryOption?.slug !== 'all' || activeSortOption.id !== 'default'

  const panelRef = useRef<HTMLDivElement>(null);
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const { light, soft } = useHaptics();

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
    soft()
    setIsSortOpen((prev) => !prev);
    setIsCategoryOpen(false);
  };

  const handleToggleCategory = () => {
    soft()
    setIsCategoryOpen((prev) => !prev);
    setIsSortOpen(false);
  };

  const handleSortChange = (newSortBy: string, newOrder: string) => {
      light()
      changeSort(newSortBy, newOrder);
      setIsSortOpen(false);
  };

  const handleCategoryChange = (newCategory: string | null) => {
      light()
      changeCategory(newCategory);  
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
          aria-label={`Category: ${activeCategoryOption?.name || 'All'}`}
          disabled={searchQuery ? true : false}
        >
          <IoGrid className={style['control-panel__btn-icon']} aria-hidden="true" />
          <span className={style['control-panel__btn-label']}>Category</span>
          <span className={style['control-panel__btn-value']}>
            {activeCategoryOption?.name || 'All'}
          </span>
        </button>

        {isFilter && (
          <button
            className={`${style['control-panel__btn']} ${style['control-panel__btn--reset']}`}
            type="button"
            aria-label="Reset all filters"
            onClick={()=>{clearAll(); light();}}
          >
            Reset
          </button>
        )}
      </div>

      <SortControl
        isOpen={isSortOpen}
        sortingOptions={sortingOptions}
        activeSortOption={activeSortOption}
        triggerRef={sortBtnRef}
        changeSort={handleSortChange}
        onClose={() => setIsSortOpen(false)}
      />
      <CategoryControl
        categoryOptions={categoryOptions}
        activeCategoryOption={activeCategoryOption}
        changeCategory={handleCategoryChange}
        isOpen={isCategoryOpen}
        onClose={() => setIsCategoryOpen(false)}
      />
    </div>
  );
};