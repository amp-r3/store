import Link from 'next/link';
import { IoArrowDown, IoSparkles } from 'react-icons/io5';
import { useHaptics, useMagneticPointer, usePointerSpotlight } from '@/shared/lib/hooks';
import { scrollToElement } from '@/shared/lib';
import style from './hero-section.module.scss';

interface HeroSectionProps {
  scrollTargetId: string;
}

export const HeroSection = ({ scrollTargetId }: HeroSectionProps) => {
  const { soft } = useHaptics();
  const { ref: heroRef } = usePointerSpotlight<HTMLElement>();
  const badgeRef = useMagneticPointer<HTMLSpanElement>();
  // The two CTAs sit right next to each other — pulling both toward a
  // cursor passing between them reads as them sticking together, so they
  // repel instead, appearing to make way for the cursor.
  const primaryCtaRef = useMagneticPointer<HTMLAnchorElement>({ repel: true });
  const secondaryCtaRef = useMagneticPointer<HTMLButtonElement>({ repel: true });
  const scrollHintRef = useMagneticPointer<HTMLButtonElement>();

  const handleExploreCategoriesClick = () => {
    soft();
    scrollToElement(scrollTargetId);
  };

  return (
    <section ref={heroRef} className={style.hero} aria-label="Introduction">
      <div className={style.hero__decor} aria-hidden="true">
        <span className={`${style.hero__blob} ${style['hero__blob--one']}`} />
        <span className={`${style.hero__blob} ${style['hero__blob--two']}`} />
        <span className={`${style.hero__blob} ${style['hero__blob--three']}`} />
        <span className={style.hero__beam} />
        <span className={style.hero__grid} />
        <span className={style.hero__grain} />
      </div>

      <div className={`${style.hero__content} container`}>
        <span ref={badgeRef} className={style.hero__badge}>
          <IoSparkles className={style.hero__badgeIcon} aria-hidden="true" />
          New Season 2026
        </span>

        <h1 className={style.hero__title}>Style That Speaks For You</h1>

        <p className={style.hero__subtitle}>
          Discover a curated selection of apparel, footwear and accessories — handpicked for every
          season and every mood.
        </p>

        <div className={style.hero__actions}>
          <Link ref={primaryCtaRef} href="/catalog" className={style.hero__cta} onClick={soft}>
            Shop Now
          </Link>
          <button
            ref={secondaryCtaRef}
            type="button"
            className={`${style.hero__cta} ${style['hero__cta--secondary']}`}
            onClick={handleExploreCategoriesClick}
          >
            Explore Categories
          </button>
        </div>
      </div>

      <button
        ref={scrollHintRef}
        type="button"
        className={style.hero__scrollHint}
        onClick={handleExploreCategoriesClick}
        aria-label="Scroll to categories"
      >
        <IoArrowDown aria-hidden="true" />
      </button>
    </section>
  );
};
