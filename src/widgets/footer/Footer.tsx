import { FooterAbout, FooterFeatures, FooterTechStack, FooterProject, FooterBottom } from "./components";
import React from 'react';
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