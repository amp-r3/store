import {
    RiSearchLine,
    RiShoppingCartLine,
    RiSmartphoneLine,
    RiFlashlightLine,
    RiShieldUserLine,
    RiHeartLine,
    RiHistoryLine,
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
    { Icon: RiFlashlightLine, label: 'Tactile Haptic Feedback' },
];

export const TECH_STACK: TechItem[] = [
    { name: 'Next.js', version: '16' },
    { name: 'React', version: '19' },
    { name: 'TypeScript', version: '5.9' },
    { name: 'Redux Toolkit', version: '2.9' },
    { name: 'RTK Query', version: '' },
    { name: 'Supabase', version: 'v2' },
    { name: 'Sass', version: '' },
];