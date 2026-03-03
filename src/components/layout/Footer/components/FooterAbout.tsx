import React from 'react';
import styles from '../footer.module.scss';

export const FooterAbout: React.FC = () => (
    <div className={styles.footer__about}>
        <h3 className={styles.footer__title}>Store</h3>
        <p className={styles.footer__description}>
            A fully responsive, dark-themed e-commerce UI with glassmorphism
            aesthetics, real-time search, smart pagination, and a Redux-powered
            shopping cart — built to demonstrate modern React architecture.
        </p>
        <div className={styles.footer__badges}>
            <span className={styles.footer__badge}>Open Source</span>
            <span className={styles.footer__badgeMit}>MIT License</span>
        </div>
    </div>
);