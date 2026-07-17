import { Link } from 'react-router';
import { IoArrowDown, IoSparkles } from 'react-icons/io5';
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
            <div className={style.hero__decor} aria-hidden="true">
                <span className={`${style.hero__blob} ${style['hero__blob--one']}`} />
                <span className={`${style.hero__blob} ${style['hero__blob--two']}`} />
                <span className={`${style.hero__blob} ${style['hero__blob--three']}`} />
            </div>

            <div className={`${style.hero__content} container`}>
                <span className={style.hero__badge}>
                    <IoSparkles className={style.hero__badgeIcon} aria-hidden="true" />
                    New Season 2026
                </span>

                <h1 className={style.hero__title}>Style That Speaks For You</h1>

                <p className={style.hero__subtitle}>
                    Discover a curated selection of apparel, footwear and accessories —
                    handpicked for every season and every mood.
                </p>

                <div className={style.hero__actions}>
                    <button type="button" className={style.hero__cta} onClick={handleShopNowClick}>
                        Shop Now
                    </button>
                    <Link
                        to="/catalog"
                        className={`${style.hero__cta} ${style['hero__cta--secondary']}`}
                        onClick={soft}
                    >
                        Browse Catalog
                    </Link>
                </div>
            </div>

            <button
                type="button"
                className={style.hero__scrollHint}
                onClick={handleShopNowClick}
                aria-label="Scroll to categories"
            >
                <IoArrowDown aria-hidden="true" />
            </button>
        </section>
    );
};
