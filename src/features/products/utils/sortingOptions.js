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

export const sortingOptions = [
    {
        id: 'default',
        label: 'by Popular',
        sortBy: null,
        order: null,
        icon: IoFlame
    },
    {
        id: 'price-asc',
        label: 'Cheap first',
        sortBy: 'price',
        order: 'asc',
        icon: IoArrowDown
    },
    {
        id: 'price-desc',
        label: 'Expensive first',
        sortBy: 'price',
        order: 'desc',
        icon: IoArrowUp
    },
    {
        id: 'title-asc',
        label: 'By name (A-Z)',
        sortBy: 'title',
        order: 'asc',
        icon: IoText
    },
    {
        id: 'stock-desc',
        label: 'By stock',
        sortBy: 'stock',
        order: 'desc',
        icon: IoCheckmarkCircle
    },
];