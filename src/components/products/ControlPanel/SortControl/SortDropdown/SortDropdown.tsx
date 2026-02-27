import { FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SortControlProps } from '../SortControl';
import { SortOptionsList } from '../SortOptionsList/SortOptionsList';
import style from './sort-dropdown.module.scss';

const DROPDOWN_MIN_WIDTH = 220;

export const SortDropdown: FC<SortControlProps> = ({
    sortingOptions,
    activeSortOption,
    triggerRef,
    changeSort,
    onClose,
    isOpen, 
}) => {
    const listRef = useRef<HTMLUListElement>(null);
    const [pos, setPos] = useState<{ top: number; right: number } | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const calc = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (rect) {
                setPos({
                    top: rect.bottom + 8,
                    right: document.documentElement.clientWidth - rect.right,
                });
            }
        };

        calc();

        const handleScroll = (e: Event) => {
            if (e.target instanceof Node && listRef.current?.contains(e.target)) return;
            onClose();
        };

        window.addEventListener('resize', calc, { passive: true });
        window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

        return () => {
            window.removeEventListener('resize', calc);
            window.removeEventListener('scroll', handleScroll, { capture: true });
        };
    }, [triggerRef, onClose, isOpen]);

    useEffect(() => {
        if (isOpen) {
            listRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <>
            <div
                className={style['sort-dropdown__backdrop']}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={style['sort-dropdown']}
                role="dialog"
                aria-label="Sort options"
                style={
                    pos
                        ? {
                            position: 'fixed',
                            top: pos.top,
                            right: pos.right,
                            minWidth: DROPDOWN_MIN_WIDTH,
                        }
                        : undefined
                }
            >
                <SortOptionsList
                    ref={listRef}
                    sortingOptions={sortingOptions}
                    activeSortOption={activeSortOption}
                    changeSort={changeSort}
                />
            </div>
        </>,
        document.body
    );
};