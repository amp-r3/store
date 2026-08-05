import { CSSProperties, KeyboardEvent, ReactNode, useRef } from 'react';

import { useHaptics } from '@/shared/lib/hooks';

import style from './segmented-tabs.module.scss';

export interface SegmentedTabItem<T extends string> {
    id: T;
    label: string;
    count?: ReactNode;
}

interface SegmentedTabsProps<T extends string> {
    items: SegmentedTabItem<T>[];
    value: T;
    onChange: (id: T) => void;
    /** Prefixes generated tab ids: `${idPrefix}-tab-${id}`. */
    idPrefix: string;
    ariaLabel: string;
    /** Rendered tabpanel's id, if one exists — sets aria-controls on each tab. Omit when there's no separate panel element to point to. */
    panelId?: string;
    size?: 'sm' | 'md';
}

export const SegmentedTabs = <T extends string>({
    items,
    value,
    onChange,
    idPrefix,
    ariaLabel,
    panelId,
    size = 'md',
}: SegmentedTabsProps<T>) => {
    const { light } = useHaptics();
    const listRef = useRef<HTMLDivElement>(null);

    const select = (next: T) => {
        if (next === value) return;
        light();
        onChange(next);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;

        event.preventDefault();
        const currentIndex = items.findIndex((item) => item.id === value);
        const offset = event.key === 'ArrowRight' ? 1 : -1;
        const next = items[(currentIndex + offset + items.length) % items.length];

        select(next.id);
        listRef.current
            ?.querySelector<HTMLButtonElement>(`#${idPrefix}-tab-${next.id}`)
            ?.focus();
    };

    const activeIndex = Math.max(items.findIndex((item) => item.id === value), 0);

    return (
        <div
            ref={listRef}
            className={`${style['tabs']} ${size === 'sm' ? style['tabs--sm'] : ''}`}
            role="tablist"
            aria-label={ariaLabel}
            onKeyDown={handleKeyDown}
            style={{ '--tab-count': items.length } as CSSProperties}
        >
            <span
                className={style['tabs__pill']}
                style={{ '--tab-index': activeIndex } as CSSProperties}
                aria-hidden="true"
            />

            {items.map((item) => {
                const isActive = item.id === value;

                return (
                    <button
                        key={item.id}
                        id={`${idPrefix}-tab-${item.id}`}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-controls={panelId}
                        tabIndex={isActive ? 0 : -1}
                        className={`${style['tabs__tab']} ${isActive ? style['tabs__tab--active'] : ''}`}
                        onClick={() => select(item.id)}
                    >
                        {item.label}
                        {item.count !== undefined && (
                            <span className={style['tabs__count']}>{item.count}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};
