import React from 'react';
import styles from '../footer.module.scss';

export const FooterAbout: React.FC = () => (
    <div className={styles.footer__about}>
        <h3 className={styles.footer__title}>Store</h3>
        <p className={styles.footer__description}>
            A fully responsive, dual-themed (Dark/Light) e-commerce SPA with glassmorphism
            aesthetics, real-time URL-synced search, a persistent Redux cart, Wishlist, and 
            complete Checkout & Order history powered by Supabase integration.
        </p>
        <div className={styles.footer__badges}>
            <span className={styles.footer__badge}>Open Source</span>
            <span className={styles.footer__badgeMit}>MIT License</span>
        </div>
    </div>
);