import { useState } from 'react';
import { DropdownMenu } from 'radix-ui';
import { Drawer } from 'vaul';
import { IoChevronDown, IoCheckmark, IoClose } from 'react-icons/io5';
import { FaSortAmountDown } from 'react-icons/fa';
import style from './reviews-sort.module.scss';
import { useHaptics, useMediaQuery } from "@/shared/lib/hooks";
import type { ReviewSort } from '@/entities/review';

export interface SortOption {
    id: ReviewSort;
    label: string;
}

const SORT_OPTIONS: SortOption[] = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'most_helpful', label: 'Most Helpful' },
];

interface ReviewsSortProps {
    value: ReviewSort;
    onChange: (sort: ReviewSort) => void;
}

export const ReviewsSort = ({ value, onChange }: ReviewsSortProps) => {
    const { soft, light } = useHaptics();
    const isMobile = useMediaQuery('(max-width: 549px)');

    const activeOption = SORT_OPTIONS.find((option) => option.id === value) ?? SORT_OPTIONS[0];
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectOption = (sort: ReviewSort) => {
        light(); // Haptic trigger for selection
        onChange(sort);
        setIsOpen(false);
    };

    const handleTriggerClick = (openState: boolean) => {
        if (openState) {
            soft(); // Haptic trigger for open action
        }
        setIsOpen(openState);
    };

    const triggerButton = (
        <button
            type="button"
            className={`${style['reviews-sort__trigger']} ${isOpen ? style['reviews-sort__trigger--open'] : ''}`}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-label={`Sort reviews by: ${activeOption.label}`}
        >
            <FaSortAmountDown className={style['reviews-sort__trigger-icon']} aria-hidden="true" />
            <span className={style['reviews-sort__trigger-label']}>Sort:</span>
            <span className={style['reviews-sort__trigger-value']}>{activeOption.label}</span>
            <IoChevronDown className={style['reviews-sort__trigger-arrow']} aria-hidden="true" />
        </button>
    );

    if (isMobile) {
        return (
            <div className={style['reviews-sort__container']}>
                <Drawer.Root open={isOpen} onOpenChange={handleTriggerClick}>
                    <Drawer.Trigger asChild>
                        {triggerButton}
                    </Drawer.Trigger>
                    <Drawer.Portal>
                        <Drawer.Overlay className={style['reviews-sort__backdrop']} />
                        <Drawer.Content className={style['reviews-sort__bottom-sheet']}>
                            <div className={style['reviews-sort__drag-handle']} />
                            <div className={style['reviews-sort__sheet-header']}>
                                <Drawer.Title className={style['reviews-sort__sheet-title']}>
                                    Sort reviews
                                </Drawer.Title>
                                <Drawer.Description className="sr-only">
                                    Choose how reviews are ordered
                                </Drawer.Description>
                                <button
                                    type="button"
                                    className={style['reviews-sort__sheet-close']}
                                    onClick={() => handleTriggerClick(false)}
                                    aria-label="Close sorting options"
                                >
                                    <IoClose aria-hidden="true" />
                                </button>
                            </div>
                            <div className={style['reviews-sort__sheet-content']}>
                                <div
                                    className={style['reviews-sort__list']}
                                    role="radiogroup"
                                    aria-label="Sort reviews options"
                                >
                                    {SORT_OPTIONS.map((option) => {
                                        const isActive = option.id === activeOption.id;
                                        return (
                                            <button
                                                key={option.id}
                                                type="button"
                                                role="radio"
                                                aria-checked={isActive}
                                                className={`${style['reviews-sort__item']} ${
                                                    isActive ? style['reviews-sort__item--active'] : ''
                                                }`}
                                                onClick={() => handleSelectOption(option.id)}
                                            >
                                                <span className={style['reviews-sort__item-label']}>
                                                    {option.label}
                                                </span>
                                                {isActive && (
                                                    <IoCheckmark className={style['reviews-sort__item-check']} aria-hidden="true" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>
            </div>
        );
    }

    const modalRoot = document.getElementById('modal-root');

    return (
        <div className={style['reviews-sort__container']}>
            <DropdownMenu.Root open={isOpen} onOpenChange={handleTriggerClick}>
                <DropdownMenu.Trigger asChild>
                    {triggerButton}
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal container={modalRoot ?? undefined}>
                    <DropdownMenu.Content
                        className={style['reviews-sort__dropdown']}
                        sideOffset={8}
                        align="end"
                    >
                        <DropdownMenu.RadioGroup
                            className={style['reviews-sort__list']}
                            value={activeOption.id}
                            onValueChange={(sortValue) => handleSelectOption(sortValue as ReviewSort)}
                        >
                            {SORT_OPTIONS.map((option) => (
                                <DropdownMenu.RadioItem
                                    key={option.id}
                                    value={option.id}
                                    className={`${style['reviews-sort__item']} ${
                                        option.id === activeOption.id ? style['reviews-sort__item--active'] : ''
                                    }`}
                                >
                                    <span className={style['reviews-sort__item-label']}>
                                        {option.label}
                                    </span>
                                    <DropdownMenu.ItemIndicator>
                                        <IoCheckmark className={style['reviews-sort__item-check']} aria-hidden="true" />
                                    </DropdownMenu.ItemIndicator>
                                </DropdownMenu.RadioItem>
                            ))}
                        </DropdownMenu.RadioGroup>
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    );
};
export default ReviewsSort;
