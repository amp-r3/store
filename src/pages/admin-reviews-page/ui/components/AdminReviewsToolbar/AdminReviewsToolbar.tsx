import { FormEvent, useEffect, useState } from 'react';
import { IoClose, IoSearchOutline } from 'react-icons/io5';

import { useDebounce } from '@/shared/lib/hooks';
import { AdminReviewSort } from '@/entities/admin';
import { Select, FilterPanel } from '@/shared/ui';

import style from './admin-reviews-toolbar.module.scss';

const SORT_OPTIONS: { value: AdminReviewSort; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'lowest_rating', label: 'Lowest rating' },
    { value: 'most_helpful', label: 'Most helpful' },
];

// Radix Select reserves an empty string value to mean "no selection" — 'all'
// is the sentinel mapped back to undefined at the onValueChange boundary below.
const RATING_OPTIONS = [
    { value: 'all', label: 'All ratings' },
    ...[5, 4, 3, 2, 1].map((stars) => ({ value: String(stars), label: `${stars} star${stars === 1 ? '' : 's'}` })),
];

interface AdminReviewsToolbarProps {
    search: string;
    rating: number | undefined;
    sort: AdminReviewSort;
    activeFilterCount: number;
    onSearchChange: (search: string) => void;
    onRatingChange: (rating: number | undefined) => void;
    onSortChange: (sort: AdminReviewSort) => void;
}

export const AdminReviewsToolbar = ({
    search,
    rating,
    sort,
    activeFilterCount,
    onSearchChange,
    onRatingChange,
    onSortChange,
}: AdminReviewsToolbarProps) => {
    const [searchInput, setSearchInput] = useState(search);
    const debouncedSearch = useDebounce(searchInput.trim(), 300);

    // Keep the input in sync with the URL (e.g. a browser back/forward nav
    // that changes ?q= without going through handleSubmit/handleClear below).
    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    // Live search: only fire when the debounced value has actually diverged
    // from the URL, so this doesn't echo `search` straight back on mount/sync.
    useEffect(() => {
        if (debouncedSearch !== search) {
            onSearchChange(debouncedSearch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        onSearchChange(searchInput.trim());
    };

    const handleClear = () => {
        setSearchInput('');
        onSearchChange('');
    };

    return (
        <FilterPanel
            activeCount={activeFilterCount}
            search={(
                <form className={style['admin-reviews-toolbar__search']} onSubmit={handleSubmit}>
                    <IoSearchOutline className={style['admin-reviews-toolbar__search-icon']} aria-hidden="true" />
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search by product"
                        aria-label="Search by product"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            className={style['admin-reviews-toolbar__clear']}
                            onClick={handleClear}
                            aria-label="Clear search"
                        >
                            <IoClose />
                        </button>
                    )}
                </form>
            )}
        >
            <Select
                variant="toolbar"
                label="Rating"
                value={rating !== undefined ? String(rating) : 'all'}
                options={RATING_OPTIONS}
                onValueChange={(value) => onRatingChange(value === 'all' ? undefined : Number(value))}
            />

            <Select
                variant="toolbar"
                label="Sort by"
                value={sort}
                options={SORT_OPTIONS}
                onValueChange={(value) => onSortChange(value as AdminReviewSort)}
            />
        </FilterPanel>
    );
};
