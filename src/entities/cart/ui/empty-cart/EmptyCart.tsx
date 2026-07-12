import { FC } from 'react';
import {
    IoCartOutline,
    IoArrowForward,
    IoSparkles,
    IoFlameOutline,
    IoRocketOutline,
    IoGiftOutline
} from 'react-icons/io5';
import styles from './empty-cart.module.scss';

interface EmptyCartProps {
    onStartShopping: () => void;
    onDiscoverClick?: (tag: string) => void;
}

export const EmptyCart: FC<EmptyCartProps> = ({ onStartShopping, onDiscoverClick }) => {

    const discoveryTags = [
        { label: 'Trending', icon: <IoFlameOutline />, id: 'trending' },
        { label: 'New Drops', icon: <IoRocketOutline />, id: 'new-drops' },
        { label: 'Gift Ideas', icon: <IoGiftOutline />, id: 'gifts' },
    ];

    return (
        <div className={styles.emptyCart}>

            {/* --- 1. Visual Centerpiece--- */}
            <div className={styles.emptyCart__visual}>
                <div className={styles.emptyCart__circle}>
                    <IoCartOutline className={styles.emptyCart__mainIcon} />

                    {/* Animated decorative elements */}
                    <IoSparkles className={`${styles.emptyCart__deco} ${styles['emptyCart__deco--top']}`} />
                    <div className={`${styles.emptyCart__deco} ${styles['emptyCart__deco--blur']}`} />
                </div>
            </div>

            {/* --- 2. Text Content --- */}
            <div className={styles.emptyCart__content}>
                <h3 className={styles.emptyCart__title}>
                    Your cart is empty
                </h3>
                <p className={styles.emptyCart__description}>
                    Looks like you haven't made your choice yet.
                    <br />
                    Ready to find something cool?
                </p>
            </div>

            {/* --- 3. Primary Action --- */}
            <button
                onClick={onStartShopping}
                className={styles.emptyCart__cta}
                type="button"
                aria-label="Start shopping"
            >
                <span>Explore Catalog</span>
                <IoArrowForward className={styles.emptyCart__ctaIcon} />
            </button>

            {/* --- 4. Discovery Chips --- */}
            <div className={styles.emptyCart__discovery}>
                <span className={styles.emptyCart__discoveryLabel}>Or discover:</span>
                <div className={styles.emptyCart__chips}>
                    {discoveryTags.map((tag) => (
                        <button
                            key={tag.id}
                            className={styles.emptyCart__chip}
                            onClick={() => onDiscoverClick?.(tag.id)}
                            type="button"
                        >
                            <span className={styles.emptyCart__chipIcon}>{tag.icon}</span>
                            {tag.label}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
};