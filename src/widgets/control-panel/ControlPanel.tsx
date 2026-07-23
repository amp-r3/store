import { FC, useState, useRef, useEffect, useCallback } from 'react';
import { IoSwapVertical, IoGrid, IoFlame } from 'react-icons/io5';
import style from './control-panel.module.scss';
import { SortingOption, SortControl } from '@/features/product-sort';
import { CategoryControl } from '@/features/product-filter';
import { Categories, Category } from '@/entities/product';
import { DropdownMenu } from 'radix-ui'
import { useHaptics } from "@/shared/lib/hooks";

interface ControlPanelProps {
  clearAll: () => void
  changeSort: (newSortBy: string | null, newOrder: string | null) => void;
  sortingOptions: SortingOption[];
  activeSortOption: SortingOption;
  changeCategory: (category: string | null) => void;
  categoryOptions: Categories;
  activeCategoryOption: Category | null;
  isFetching: boolean;
  isDealsActive: boolean;
  toggleDeals: () => void;
}

export const ControlPanel: FC<ControlPanelProps> = ({
  changeSort,
  sortingOptions,
  activeSortOption,
  changeCategory,
  categoryOptions,
  activeCategoryOption,
  clearAll,
  isFetching,
  isDealsActive,
  toggleDeals,
}) => {

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const isFilter = activeCategoryOption?.slug !== 'all' || activeSortOption.id !== 'default' || isDealsActive

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


  const handleToggleCategory = () => {
    soft()
    setIsCategoryOpen((prev) => !prev);
    setIsSortOpen(false);
  };

  const handleSortChange = useCallback((newSortBy: string | null, newOrder: string | null) => {
    light()
    changeSort(newSortBy, newOrder);
    setIsSortOpen(false);
  }, [changeSort, light]);

  const handleCategoryChange = (newCategory: string | null) => {
    light()
    changeCategory(newCategory);
  };

  const handleToggleDeals = () => {
    light()
    toggleDeals();
  };

  return (
    <div className={`${style['control-panel']} ${isFetching ? style['control-panel__fetching-state'] : ''}`} ref={panelRef}>
      <DropdownMenu.Root
        open={isSortOpen}
        onOpenChange={(open) => {
          if (open) {
            soft();
            setIsCategoryOpen(false);
          }
          setIsSortOpen(open);
        }}
      >
        <div className={style['control-panel__group']}>

          <DropdownMenu.Trigger asChild>
            <button
              ref={sortBtnRef}
              className={style['control-panel__btn']}
              type="button"
              aria-expanded={isSortOpen}
              aria-label={`Sort by: ${activeSortOption?.label}`}
            >
              <IoSwapVertical className={style['control-panel__btn-icon']} aria-hidden="true" />
              <span className={style['control-panel__btn-label']}>Sort</span>
              <span className={style['control-panel__btn-value']}>{activeSortOption?.label}</span>
            </button>
          </DropdownMenu.Trigger>

          <button
            className={style['control-panel__btn']}
            type="button"
            onClick={handleToggleCategory}
            aria-expanded={isCategoryOpen}
            aria-label={`Category: ${activeCategoryOption?.name || 'All'}`}
          >
            <IoGrid className={style['control-panel__btn-icon']} aria-hidden="true" />
            <span className={style['control-panel__btn-label']}>Category</span>
            <span className={style['control-panel__btn-value']}>
              {activeCategoryOption?.name || 'All'}
            </span>
          </button>

          <button
            className={`${style['control-panel__btn']} ${isDealsActive ? style['control-panel__btn--active'] : ''}`}
            type="button"
            onClick={handleToggleDeals}
            aria-pressed={isDealsActive}
            aria-label={isDealsActive ? 'Deals filter on' : 'Show deals only'}
          >
            <IoFlame className={style['control-panel__btn-icon']} aria-hidden="true" />
            <span className={style['control-panel__btn-value']}>Deals</span>
          </button>

          {isFilter && (
            <button
              className={`${style['control-panel__btn']} ${style['control-panel__btn--reset']}`}
              type="button"
              aria-label="Reset all filters"
              onClick={() => { clearAll(); light(); }}
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
      </DropdownMenu.Root>

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