import { KeyboardEvent, useRef } from 'react';

import { useHaptics } from '@/shared/lib/hooks';

import style from './user-reviews-tabs.module.scss';

export type ReviewsTab = 'written' | 'pending';

interface UserReviewsTabsProps {
    tab: ReviewsTab;
    writtenCount: number;
    pendingCount: number;
    onChange: (tab: ReviewsTab) => void;
}

const TABS: { id: ReviewsTab; label: string }[] = [
    { id: 'written', label: 'Written' },
    { id: 'pending', label: 'Pending' },
];

export const UserReviewsTabs = ({ tab, writtenCount, pendingCount, onChange }: UserReviewsTabsProps) => {
    const { light } = useHaptics();
    const listRef = useRef<HTMLDivElement>(null);

    const counts: Record<ReviewsTab, number> = {
        written: writtenCount,
        pending: pendingCount,
    };

    const select = (next: ReviewsTab) => {
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
            ?.querySelector<HTMLButtonElement>(`#user-reviews-tab-${next.id}`)
            ?.focus();
    };

    return (
        <div
            ref={listRef}
            className={style['reviews-tabs']}
            role="tablist"
            aria-label="Review sections"
            onKeyDown={handleKeyDown}
        >
            <span
                className={style['reviews-tabs__pill']}
                data-tab={tab}
                aria-hidden="true"
            />

            {TABS.map((item) => {
                const isActive = item.id === tab;

                return (
                    <button
                        key={item.id}
                        id={`user-reviews-tab-${item.id}`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={`user-reviews-panel-${item.id}`}
                        tabIndex={isActive ? 0 : -1}
                        className={`${style['reviews-tabs__tab']} ${isActive ? style['reviews-tabs__tab--active'] : ''}`}
                        onClick={() => select(item.id)}
                    >
                        {item.label}
                        <span className={style['reviews-tabs__count']}>{counts[item.id]}</span>
                    </button>
                );
            })}
        </div>
    );
};
