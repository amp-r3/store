import { FC, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoCheckmark } from 'react-icons/io5';
import style from './sort-control.module.scss';
import { SortingOption } from '@/utils/sortingOptions';

interface SortControlProps {
  sortingOptions: SortingOption[];
  activeSortOption: SortingOption;
  triggerRef: React.RefObject<HTMLButtonElement>;
  changeSort: (newSortBy: string) => void;
  onClose: () => void;
}

const DROPDOWN_MIN_WIDTH = 220;
const MOBILE_BREAKPOINT = 550;

export const SortControl: FC<SortControlProps> = ({
  sortingOptions,
  activeSortOption,
  triggerRef,
  changeSort,
  onClose,
}) => {
  const listRef = useRef<HTMLUListElement>(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (isMobile) return;

    const calcPosition = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: document.documentElement.clientWidth - rect.right,
      });
    };

    calcPosition();

    const handleScroll = (e: Event) => {
      if (e.target instanceof Node && listRef.current?.contains(e.target)) return;
      onClose();
    };

    window.addEventListener('resize', calcPosition);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', calcPosition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isMobile, triggerRef, onClose]);

  useEffect(() => {
    const firstBtn = listRef.current?.querySelector<HTMLButtonElement>('button');
    firstBtn?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSelect = (id: string) => {
    changeSort(id);
    setTimeout(() => {
      onClose();
    }, 150); 
  };

  const content = (
    <>
      <div
        className={style['sort-control__backdrop']}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={style['sort-control']}
        role="dialog"
        aria-label="Sort options"
        style={
          !isMobile && dropdownPos
            ? {
              position: 'fixed',
              top: dropdownPos.top,
              right: dropdownPos.right,
              minWidth: DROPDOWN_MIN_WIDTH,
            }
            : undefined
        }
      >
        <div className={style['sort-control__header']}>
          <span className={style['sort-control__title']}>Sort by</span>
          <button
            className={style['sort-control__close']}
            type="button"
            onClick={onClose}
            aria-label="Close sort options"
          >
            ✕
          </button>
        </div>

        <ul
          className={style['sort-control__list']}
          role="listbox"
          aria-label="Sort options"
          ref={listRef}
        >
          {sortingOptions.map((option) => {
            const isActive = option.id === activeSortOption?.id;
            const Icon = option.icon;

            return (
              <li key={option.id} role="option" aria-selected={isActive}>
                <button
                  className={`${style['sort-control__item']} ${isActive ? style['sort-control__item--active'] : ''}`}
                  type="button"
                  onClick={() => handleSelect(option.id)}
                >
                  {Icon && (
                    <Icon
                      className={style['sort-control__item-icon']}
                      aria-hidden="true"
                    />
                  )}
                  <span className={style['sort-control__item-label']}>{option.label}</span>
                  {isActive && (
                    <IoCheckmark
                      className={style['sort-control__item-check']}
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );

  return createPortal(content, document.body);
};