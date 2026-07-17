import { CategoryShowcase } from '@/widgets/category-showcase';
import { DealsShowcase } from '@/widgets/deals-showcase';
import { HeroSection } from './components/HeroSection/HeroSection';
import { TrustSignals } from './components/TrustSignals/TrustSignals';
import { PromoBanner } from './components/PromoBanner/PromoBanner';

const CATEGORY_SHOWCASE_ID = 'category-showcase';

export const HomePage = () => {
    return (
        <main>
            <HeroSection scrollTargetId={CATEGORY_SHOWCASE_ID} />
            <TrustSignals />
            <DealsShowcase />
            <CategoryShowcase id={CATEGORY_SHOWCASE_ID} />
            <PromoBanner />
        </main>
    );
};
