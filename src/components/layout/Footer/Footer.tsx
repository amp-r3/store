import React from 'react';
import { FaGithub, FaTelegramPlane, FaLinkedin, FaHeart, FaExternalLinkAlt } from 'react-icons/fa';
import styles from './footer.module.scss';

const FEATURES = [
    { icon: '🔍', label: 'Instant URL-synced Search' },
    { icon: '🛒', label: 'Redux Shopping Cart' },
    { icon: '↕️', label: 'Advanced Sorting' },
    { icon: '📄', label: 'Product Detail Pages' },
    { icon: '📱', label: 'Responsive & Mobile-First' },
    { icon: '⚡', label: 'Lazy Routes & Memoized Selectors' },
];

const TECH_STACK = [
    { name: 'React', version: '19' },
    { name: 'TypeScript', version: '5.9' },
    { name: 'Redux Toolkit', version: '2.9' },
    { name: 'RTK Query', version: '' },
    { name: 'React Router', version: 'v7' },
    { name: 'Vite', version: '7' },
    { name: 'SCSS Modules', version: '' },
];

export const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer__container}>
                <div className={styles.footer__content}>

                    {/* About Section */}
                    <div className={styles.footer__about}>
                        <h3 className={styles.footer__title}>Electro Store</h3>
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

                    {/* Features */}
                    <div className={styles.footer__links}>
                        <h3 className={styles.footer__title}>Features</h3>
                        <ul className={styles.footer__list}>
                            {FEATURES.map(({ icon, label }) => (
                                <li key={label} className={styles.footer__item}>
                                    <span className={styles.footer__itemIcon}>{icon}</span>
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Tech Stack */}
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

                    {/* Links & Socials */}
                    <div className={styles.footer__socials}>
                        <h3 className={styles.footer__title}>Project</h3>

                        <div className={styles.footer__projectLinks}>
                            <a
                                href="https://amp-r3-store.netlify.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.footer__projectLink}
                            >
                                <FaExternalLinkAlt />
                                Live Demo
                            </a>
                            <a
                                href="https://github.com/amp-r3/store"
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.footer__projectLink}
                            >
                                <FaGithub />
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
                                <FaGithub />
                            </a>
                            <a
                                href="https://t.me/amp_r3"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Telegram"
                                className={styles.footer__icon}
                            >
                                <FaTelegramPlane />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/amir-ergashev-96718a396"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className={styles.footer__icon}
                            >
                                <FaLinkedin />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className={styles.footer__bottom}>
                    <p className={styles.footer__copy}>
                        &copy; {new Date().getFullYear()}{' '}
                        <span>E-Store</span>. Developed by Amir (amp3re).
                    </p>
                    <p className={styles.footer__madeWith}>
                        Made with <FaHeart /> and React
                    </p>
                </div>
            </div>
        </footer>
    );
};