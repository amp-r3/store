'use client';

import { useGetCategoriesQuery } from '@/entities/product';
import type { Categories, ProductsResponse } from '@/entities/product';
import { ErrorView } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';
import { CategoryRow } from './CategoryRow/CategoryRow';
import { CategoryRowSkeleton } from './CategoryRow/CategoryRowSkeleton';
import style from './category-showcase.module.scss';

const SKELETON_ROWS_COUNT = 3;

interface CategoryShowcaseProps {
  id?: string;
  initialCategories?: Categories;
  initialCategoryProducts?: Record<string, ProductsResponse>;
}

export const CategoryShowcase = ({
  id,
  initialCategories,
  initialCategoryProducts,
}: CategoryShowcaseProps) => {
  const { data: liveCategories, isLoading: isLiveLoading, error } = useGetCategoriesQuery();
  const categories = liveCategories ?? initialCategories;
  const isLoading = isLiveLoading && !categories;

  if (error) {
    const errorMessage = getErrorMessage(error);
    return (
      <section id={id} className={style.categoryShowcase} aria-label="Shop by category">
        <ErrorView error={errorMessage} />
      </section>
    );
  }

  const realCategories = (categories ?? []).filter((category) => category.slug !== 'all');

  return (
    <section id={id} className={style.categoryShowcase} aria-label="Shop by category">
      <div className={`${style.categoryShowcase__inner} container`}>
        {isLoading
          ? Array.from({ length: SKELETON_ROWS_COUNT }).map((_, index) => (
              <CategoryRowSkeleton key={`category-row-skeleton-${index}`} />
            ))
          : realCategories.map((category, index) => (
              <CategoryRow
                key={category.slug}
                category={category}
                priority={index === 0}
                initialProducts={initialCategoryProducts?.[category.slug]}
              />
            ))}
      </div>
    </section>
  );
};
