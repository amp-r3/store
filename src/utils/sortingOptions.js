import {
    IoFlame,
    IoArrowDown,
    IoArrowUp,
    IoText,
    IoCheckmarkCircle
} from 'react-icons/io5';
/**
 * Массив объектов с опциями для сортировки продуктов.
 * Каждый объект содержит:
 * - id: Уникальный идентификатор для отслеживания активной сортировки.
 * - label: Текст, который будет отображаться на кнопке/в списке.
 * - sortBy: Параметр `sortBy` для API запроса. `null` для сортировки по умолчанию.
 * - order: Параметр `order` для API запроса (`asc` или `desc`). `null` для сортировки по умолчанию.
 */

export const sortingOptions = [
    {
        id: 'default',
        label: 'Популярные',
        sortBy: null,
        order: null,
        icon: IoFlame 
    },
    {
        id: 'price-asc',
        label: 'Сначала дешевые',
        sortBy: 'price',
        order: 'asc',
        icon: IoArrowDown 
    },
    {
        id: 'price-desc',
        label: 'Сначала дорогие',
        sortBy: 'price',
        order: 'desc',
        icon: IoArrowUp 
    },
    {
        id: 'title-asc',
        label: 'По названию (А-Я)',
        sortBy: 'title',
        order: 'asc',
        icon: IoText
    },
    {
        id: 'stock-desc',
        label: 'По наличию',
        sortBy: 'stock',
        order: 'desc',
        icon: IoCheckmarkCircle
    },
];