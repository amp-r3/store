'use client';

import { CategoryShowcase } from '@/widgets/category-showcase';
import { DealsShowcase } from '@/widgets/deals-showcase';
import { HeroSection } from './components/HeroSection/HeroSection';
import { TrustSignals } from './components/TrustSignals/TrustSignals';
import { PromoBanner } from './components/PromoBanner/PromoBanner';
import type { Categories, Product, ProductsResponse } from '@/entities/product';

const CATEGORY_SHOWCASE_ID = 'category-showcase';

interface HomePageProps {
    initialCategories?: Categories;
    initialDeals?: Product[];
    initialCategoryProducts?: Record<string, ProductsResponse>;
}

export const HomePage = ({ initialCategories, initialDeals, initialCategoryProducts }: HomePageProps = {}) => {
    return (
        <main>
            <HeroSection scrollTargetId={CATEGORY_SHOWCASE_ID} />
            <TrustSignals />
            <DealsShowcase initialProducts={initialDeals} />
            <CategoryShowcase
                id={CATEGORY_SHOWCASE_ID}
                initialCategories={initialCategories}
                initialCategoryProducts={initialCategoryProducts}
            />
            <PromoBanner />
        </main>
    );
};
