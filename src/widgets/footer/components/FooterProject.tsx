import React from 'react';
import {
    RiGithubFill,
    RiTelegramFill,
    RiLinkedinBoxFill,
    RiShareBoxLine,
} from 'react-icons/ri';
import styles from '../footer.module.scss';

export const FooterProject: React.FC = () => (
    <div className={styles.footer__socials}>
        <h3 className={styles.footer__title}>Project</h3>

        <div className={styles.footer__projectLinks}>
            <a
                href="https://amp-r3-store.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footer__projectLink}
            >
                <RiShareBoxLine />
                Live Demo
            </a>
            <a
                href="https://github.com/amp-r3/store"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footer__projectLink}
            >
                <RiGithubFill />
                Source Code
            </a>
        </div>

        <h3 className={`${styles.footer__title} ${styles.footer__titleConnect}`}>
            Connect
        </h3>
        <div className={styles.footer__socialIcons}>
            <a
                href="https://github.com/amp-r3"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className={styles.footer__icon}
            >
                <RiGithubFill />
            </a>
            <a
                href="https://t.me/amp_r3"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className={styles.footer__icon}
            >
                <RiTelegramFill />
            </a>
            <a
                href="https://www.linkedin.com/in/amir-ergashev-96718a396"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className={styles.footer__icon}
            >
                <RiLinkedinBoxFill />
            </a>
        </div>
    </div>
);