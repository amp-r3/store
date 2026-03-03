import {
    RiSearchLine,
    RiShoppingCartLine,
    RiArrowUpDownLine,
    RiFileTextLine,
    RiSmartphoneLine,
    RiFlashlightLine,
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
    { Icon: RiShoppingCartLine, label: 'Redux Shopping Cart' },
    { Icon: RiArrowUpDownLine, label: 'Advanced Sorting' },
    { Icon: RiFileTextLine, label: 'Product Detail Pages' },
    { Icon: RiSmartphoneLine, label: 'Responsive & Mobile-First' },
    { Icon: RiFlashlightLine, label: 'Lazy Routes & Memoized Selectors' },
];

export const TECH_STACK: TechItem[] = [
    { name: 'React', version: '19' },
    { name: 'TypeScript', version: '5.9' },
    { name: 'Redux Toolkit', version: '2.9' },
    { name: 'RTK Query', version: '' },
    { name: 'React Router', version: 'v7' },
    { name: 'Vite', version: '7' },
    { name: 'SCSS Modules', version: '' },
];