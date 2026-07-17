import { useHaptics } from '@/shared/lib/hooks';
import { scrollToElement } from '@/shared/lib';
import style from './hero-section.module.scss';

interface HeroSectionProps {
    scrollTargetId: string;
}

export const HeroSection = ({ scrollTargetId }: HeroSectionProps) => {
    const { soft } = useHaptics();

    const handleShopNowClick = () => {
        soft();
        scrollToElement(scrollTargetId);
    };

    return (
        <section className={style.hero} aria-label="Introduction">
            <div className={`${style.hero__content} container`}>
                <h1 className={style.hero__title}>Style That Speaks For You</h1>
                <p className={style.hero__subtitle}>
                    Discover a curated selection of apparel, footwear and accessories —
                    handpicked for every season and every mood.
                </p>
                <button type="button" className={style.hero__cta} onClick={handleShopNowClick}>
                    Shop Now
                </button>
            </div>
        </section>
    );
};
