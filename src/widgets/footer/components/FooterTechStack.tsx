import React from 'react';
import { TECH_STACK } from '../footer.constants';
import styles from '../footer.module.scss';

export const FooterTechStack: React.FC = () => (
    <div className={styles.footer__links}>
        <h3 className={styles.footer__title}>Tech Stack</h3>
        <ul className={styles.footer__list}>
            {TECH_STACK.map(({ name, version }) => (
                <li key={name} className={styles.footer__item}>
                    {name}
                    {version && (
                        <span className={styles.footer__version}>{version}</span>
                    )}
                </li>
            ))}
        </ul>
    </div>
);