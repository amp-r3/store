import { KeyboardEvent, useRef } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { useHaptics } from '@/shared/lib/hooks';
import { OrderCounts, OrdersScope } from '@/entities/order';

import style from './user-orders-tabs.module.scss';

interface UserOrdersTabsProps {
    tab: OrdersScope;
    counts?: OrderCounts;
    onChange: (tab: OrdersScope) => void;
}

const TABS: { id: OrdersScope; label: string }[] = [
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' },
];

export const UserOrdersTabs = ({ tab, counts, onChange }: UserOrdersTabsProps) => {
    const { light } = useHaptics();
    const listRef = useRef<HTMLDivElement>(null);

    const select = (next: OrdersScope) => {
        if (next === tab) return;
        light();
        onChange(next);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

        event.preventDefault();
        const currentIndex = TABS.findIndex((item) => item.id === tab);
        const offset = event.key === 'ArrowRight' ? 1 : -1;
        const next = TABS[(currentIndex + offset + TABS.length) % TABS.length];

        select(next.id);
        listRef.current
            ?.querySelector<HTMLButtonElement>(`#user-orders-tab-${next.id}`)
            ?.focus();
    };

    return (
        <div
            ref={listRef}
            className={style['orders-tabs']}
            role="tablist"
            aria-label="Order sections"
            onKeyDown={handleKeyDown}
        >
            <span
                className={style['orders-tabs__pill']}
                data-tab={tab}
                aria-hidden="true"
            />

            {TABS.map((item) => {
                const isActive = item.id === tab;

                return (
                    <button
                        key={item.id}
                        id={`user-orders-tab-${item.id}`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`user-orders-panel-${item.id}`}
                        tabIndex={isActive ? 0 : -1}
                        className={`${style['orders-tabs__tab']} ${isActive ? style['orders-tabs__tab--active'] : ''}`}
                        onClick={() => select(item.id)}
                    >
                        {item.label}
                        <span className={style['orders-tabs__count']}>
                            {counts ? counts[item.id] : <Skeleton width={16} height={12} inline />}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
