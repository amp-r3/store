import React from 'react';
import { FEATURES } from '../footer.constants';
import styles from '../footer.module.scss';

export const FooterFeatures: React.FC = () => (
    <div className={styles.footer__links}>
        <h3 className={styles.footer__title}>Features</h3>
        <ul className={styles.footer__list}>
            {FEATURES.map(({ Icon, label }) => (
                <li key={label} className={styles.footer__item}>
                    <span className={styles.footer__itemIcon}><Icon /></span>
                    {label}
                </li>
            ))}
        </ul>
    </div>
);