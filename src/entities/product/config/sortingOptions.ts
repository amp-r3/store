import {
    IoFlame,
    IoArrowDown,
    IoArrowUp,
    IoText,
    IoCheckmarkCircle
} from 'react-icons/io5';
/**
* An array of objects with product sorting options.
* Each object contains:
* - id: Unique identifier for tracking active sorting.
* - label: Text to display on the button/in the list.
* - sortBy: The `sortBy` parameter for the API request. `null` for default sorting.
* - order: The `order` parameter for the API request (`asc` or `desc`). `null` for default sorting.
 */

import { IconType } from 'react-icons';

export type SortField = 'price' | 'title' | 'stock';
export type SortOrder = 'asc' | 'desc';

export interface SortingOption {
    id: string;
    label: string;
    sortBy: SortField | null;
    order: SortOrder | null;
    icon: IconType;
}

export const sortingOptions: SortingOption[] = [
    {
        id: 'default',
        label: 'Trending',
        sortBy: null,
        order: null,
        icon: IoFlame
    },
    {
        id: 'price-asc',
        label: 'Lowest Price',
        sortBy: 'price',
        order: 'asc',
        icon: IoArrowDown
    },
    {
        id: 'price-desc',
        label: 'Highest Price',
        sortBy: 'price',
        order: 'desc',
        icon: IoArrowUp
    },
    {
        id: 'title-asc',
        label: 'Alphabetical',
        sortBy: 'title',
        order: 'asc',
        icon: IoText
    },
    {
        id: 'stock-desc',
        label: 'Availability',
        sortBy: 'stock',
        order: 'desc',
        icon: IoCheckmarkCircle
    },
] as const;
