import { FC, useCallback, useEffect, useRef, useMemo } from 'react';
import style from './category-list.module.scss';
import { Categories, Category } from '@/entities/product';

interface CategoryListProps {
  categoryOptions: Categories;
  activeCategoryOption: Category | null;
  changeCategory: (newCategory: string | null) => void;
  onClose?: () => void;
}

export const CategoryList: FC<CategoryListProps> = ({
  categoryOptions,
  activeCategoryOption,
  changeCategory,
  onClose,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCategoryRef = useRef<string | null>(null);
  // Kept fresh every render so the unmount-flush below always calls the
  // latest props, without making them cleanup-effect dependencies.
  const changeCategoryRef = useRef(changeCategory);
  changeCategoryRef.current = changeCategory;
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleSelect = useCallback((newCategory: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    pendingCategoryRef.current = newCategory;
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      pendingCategoryRef.current = null;
      onCloseRef.current?.();
      changeCategoryRef.current(newCategory);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        // The picker can unmount mid-debounce (drawer swiped/backdropped
        // away right after a tap) — commit the pending pick instead of
        // silently dropping the user's selection.
        if (pendingCategoryRef.current) {
          changeCategoryRef.current(pendingCategoryRef.current);
          pendingCategoryRef.current = null;
        }
      }
    };
  }, []);

  const sortedOptions = useMemo(() => {
    const DEFAULT_CATEGORY_ID = 'all';
    const rank = (slug: string) => {
      if (slug === DEFAULT_CATEGORY_ID) return 0;
      if (activeCategoryOption && slug === activeCategoryOption.slug) return 1;
      return 2;
    };

    return [...categoryOptions].sort((a, b) => rank(a.slug) - rank(b.slug));
  }, [categoryOptions, activeCategoryOption]);

  if (sortedOptions.length === 0) {
    return <p className={style['category-list__empty']}>No categories available.</p>;
  }

  return (
    <ul className={style['category-list']}>
      {sortedOptions.map((option) => {
        const isActive = option.slug === activeCategoryOption?.slug;

        return (
          <li key={option.slug}>
            <button
              type="button"
              className={`${style['category-list__item']} ${isActive ? style['category-list__item--active'] : ''}`}
              onClick={() => handleSelect(option.slug)}
              aria-pressed={isActive}
            >
              <span className={style['category-list__item-label']}>{option.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};
