import { FormEvent, useEffect, useState } from 'react';
import { IoClose, IoSearchOutline } from 'react-icons/io5';

import { useDebounce } from '@/shared/lib/hooks';
import { AdminReviewSort } from '@/entities/admin';

import style from './admin-reviews-toolbar.module.scss';

const SORT_OPTIONS: { value: AdminReviewSort; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'lowest_rating', label: 'Lowest rating' },
    { value: 'most_helpful', label: 'Most helpful' },
];

interface AdminReviewsToolbarProps {
    search: string;
    rating: number | undefined;
    sort: AdminReviewSort;
    onSearchChange: (search: string) => void;
    onRatingChange: (rating: number | undefined) => void;
    onSortChange: (sort: AdminReviewSort) => void;
}

export const AdminReviewsToolbar = ({
    search,
    rating,
    sort,
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
        <div className={style['admin-reviews-toolbar']}>
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

            <label className={style['admin-reviews-toolbar__filter']}>
                <span>Rating</span>
                <select
                    value={rating ?? ''}
                    onChange={(event) => onRatingChange(event.target.value ? Number(event.target.value) : undefined)}
                >
                    <option value="">All ratings</option>
                    {[5, 4, 3, 2, 1].map((stars) => (
                        <option key={stars} value={stars}>{stars} star{stars === 1 ? '' : 's'}</option>
                    ))}
                </select>
            </label>

            <label className={style['admin-reviews-toolbar__filter']}>
                <span>Sort by</span>
                <select value={sort} onChange={(event) => onSortChange(event.target.value as AdminReviewSort)}>
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </label>
        </div>
    );
};
