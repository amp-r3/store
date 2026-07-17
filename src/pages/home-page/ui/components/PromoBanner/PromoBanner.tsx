import { Link } from 'react-router';
import { useHaptics } from '@/shared/lib/hooks';
import style from './promo-banner.module.scss';

export const PromoBanner = () => {
    const { soft } = useHaptics();

    return (
        <section className={style.promoBanner} aria-label="Browse the full catalog">
            <div className="container">
                <div className={style.promoBanner__card}>
                    <h2 className={style.promoBanner__title}>Ready to Refresh Your Wardrobe?</h2>
                    <p className={style.promoBanner__subtitle}>
                        Explore the full collection — new arrivals added every week.
                    </p>
                    <Link to="/catalog" className={style.promoBanner__cta} onClick={soft}>
                        Browse Catalog
                    </Link>
                </div>
            </div>
        </section>
    );
};
