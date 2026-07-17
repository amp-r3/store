import { CategoryShowcase } from '@/widgets/category-showcase';
import { HeroSection } from './components/HeroSection/HeroSection';
import { TrustSignals } from './components/TrustSignals/TrustSignals';

const CATEGORY_SHOWCASE_ID = 'category-showcase';

export const HomePage = () => {
    return (
        <main>
            <HeroSection scrollTargetId={CATEGORY_SHOWCASE_ID} />
            <TrustSignals />
            <CategoryShowcase id={CATEGORY_SHOWCASE_ID} />
        </main>
    );
};
