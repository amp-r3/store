import React from 'react';
import { RiHeartFill } from 'react-icons/ri';
import styles from '../footer.module.scss';

export const FooterBottom: React.FC = () => (
    <div className={styles.footer__bottom}>
        <p className={styles.footer__copy}>
            &copy; {new Date().getFullYear()}{' '}
            <span>Store</span>. Developed by Amir (amp-r3).
        </p>
        <p className={styles.footer__madeWith}>
            Made with <RiHeartFill /> and React
        </p>
    </div>
);