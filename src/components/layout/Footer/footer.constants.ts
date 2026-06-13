import {
    RiSearchLine,
    RiShoppingCartLine,
    RiArrowUpDownLine,
    RiSmartphoneLine,
    RiFlashlightLine,
    RiShieldUserLine,
    RiHeartLine,
    RiHistoryLine,
    RiPaletteLine,
} from 'react-icons/ri';
import { ComponentType } from 'react';

export interface Feature {
    Icon: ComponentType;
    label: string;
}

export interface TechItem {
    name: string;
    version: string;
}

export const FEATURES: Feature[] = [
    { Icon: RiSearchLine, label: 'Instant URL-synced Search' },
    { Icon: RiShoppingCartLine, label: 'Redux Cart with Cloud Sync' },
    { Icon: RiShieldUserLine, label: 'Supabase Auth & Profiles' },
    { Icon: RiHeartLine, label: 'Cloud-synced Wishlist' },
    { Icon: RiHistoryLine, label: 'Secure Checkout & Order History' },
    { Icon: RiSmartphoneLine, label: 'Responsive & Mobile-First' },
    { Icon: RiPaletteLine, label: 'Dual Theme (Dark / Light)' },
    { Icon: RiFlashlightLine, label: 'Tactile Haptic Feedback' },
];

export const TECH_STACK: TechItem[] = [
    { name: 'React', version: '19' },
    { name: 'TypeScript', version: '5.9' },
    { name: 'Redux Toolkit', version: '2.9' },
    { name: 'RTK Query', version: '' },
    { name: 'React Router', version: 'v7' },
    { name: 'Vite', version: '8' },
    { name: 'Supabase', version: 'v2' },
    { name: 'LightningCSS', version: '1.32' },
];