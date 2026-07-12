import { useState } from 'react';
import { DropdownMenu } from 'radix-ui';
import { Drawer } from 'vaul';
import { IoChevronDown, IoCheckmark } from 'react-icons/io5';
import { FaSortAmountDown } from 'react-icons/fa';
import style from './reviews-sort.module.scss';
import { useHaptics, useMediaQuery } from "@/shared/lib/hooks";

export interface SortOption {
    id: string;
    label: string;
}

const SORT_OPTIONS: SortOption[] = [
    { id: 'newest', label: 'Newest First' },
    { id: 'highest', label: 'Highest Rated' },
    { id: 'lowest', label: 'Lowest Rated' },
];

export const ReviewsSort = () => {
    const { soft, light } = useHaptics();
    const isMobile = useMediaQuery('(max-width: 549px)');
    
    // Manage local visual selected option (purely visual representation)
    const [activeOption, setActiveOption] = useState<SortOption>(SORT_OPTIONS[0]);
    const [isOpen, setIsOpen] = useState(false);

    const handleSelectOption = (option: SortOption) => {
        light(); // Haptic trigger for selection
        setActiveOption(option);
        setIsOpen(false);
    };

    const handleTriggerClick = (openState: boolean) => {
        if (openState) {
            soft(); // Haptic trigger for open action
        }
        setIsOpen(openState);
    };

    // Shared list of options to render in both Desktop and Mobile views
    const renderOptionsList = () => (
        <ul className={style['reviews-sort__list']} role="listbox" aria-label="Sort reviews options">
            {SORT_OPTIONS.map((option) => {
                const isActive = option.id === activeOption.id;
                return (
                    <li key={option.id} role="option" aria-selected={isActive}>
                        <button
                            type="button"
                            className={`${style['reviews-sort__item']} ${
                                isActive ? style['reviews-sort__item--active'] : ''
                            }`}
                            onClick={() => handleSelectOption(option)}
                        >
                            <span className={style['reviews-sort__item-label']}>
                                {option.label}
                            </span>
                            {isActive && (
                                <IoCheckmark className={style['reviews-sort__item-check']} aria-hidden="true" />
                            )}
                        </button>
                    </li>
                );
            })}
        </ul>
    );

    const triggerButton = (
        <button
            type="button"
            className={`${style['reviews-sort__trigger']} ${isOpen ? style['reviews-sort__trigger--open'] : ''}`}
            aria-expanded={isOpen}
            aria-label={`Sort reviews by: ${activeOption.label}`}
        >
            <FaSortAmountDown className={style['reviews-sort__trigger-icon']} />
            <span className={style['reviews-sort__trigger-label']}>Sort:</span>
            <span className={style['reviews-sort__trigger-value']}>{activeOption.label}</span>
            <IoChevronDown className={style['reviews-sort__trigger-arrow']} />
        </button>
    );

    if (isMobile) {
        return (
            <div className={style['reviews-sort__container']}>
                <Drawer.Root open={isOpen} onOpenChange={(open) => handleTriggerClick(open)}>
                    <Drawer.Trigger asChild>
                        {triggerButton}
                    </Drawer.Trigger>
                    <Drawer.Portal>
                        <Drawer.Overlay className={style['reviews-sort__backdrop']} />
                        <Drawer.Content 
                            className={style['reviews-sort__bottom-sheet']}
                            aria-describedby={undefined}
                        >
                            <div className={style['reviews-sort__drag-handle']} />
                            <div className={style['reviews-sort__sheet-header']}>
                                <Drawer.Title className={style['reviews-sort__sheet-title']}>
                                    Sort reviews
                                </Drawer.Title>
                                <button
                                    type="button"
                                    className={style['reviews-sort__sheet-close']}
                                    onClick={() => handleTriggerClick(false)}
                                    aria-label="Close sorting options"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className={style['reviews-sort__sheet-content']}>
                                {renderOptionsList()}
                            </div>
                        </Drawer.Content>
                    </Drawer.Portal>
                </Drawer.Root>
            </div>
        );
    }

    return (
        <div className={style['reviews-sort__container']}>
            <DropdownMenu.Root open={isOpen} onOpenChange={(open) => handleTriggerClick(open)}>
                <DropdownMenu.Trigger asChild>
                    {triggerButton}
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal container={document.getElementById('modal-root')!}>
                    <DropdownMenu.Content
                        className={style['reviews-sort__dropdown']}
                        sideOffset={8}
                        align="end"
                    >
                        {renderOptionsList()}
                    </DropdownMenu.Content>
                </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
    );
};
export default ReviewsSort;
