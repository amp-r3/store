import React from 'react';
import { FooterAbout } from './components/FooterAbout';
import { FooterFeatures } from './components/FooterFeatures';
import { FooterTechStack } from './components/FooterTechStack';
import { FooterProject } from './components/FooterProject';
import { FooterBottom } from './components/FooterBottom';
import styles from './footer.module.scss';

export const Footer: React.FC = () => (
    <footer className={styles.footer}>
        <div className={styles.footer__container}>
            <div className={styles.footer__content}>
                <FooterAbout />
                <FooterFeatures />
                <FooterTechStack />
                <FooterProject />
            </div>
            <FooterBottom />
        </div>
    </footer>
);