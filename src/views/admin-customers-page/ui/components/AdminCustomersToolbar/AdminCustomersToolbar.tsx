import { FormEvent, useEffect, useState } from 'react';
import { IoClose, IoSearchOutline } from 'react-icons/io5';

import { useDebounce } from '@/shared/lib/hooks';
import { AdminCustomersSort, UserRole } from '@/entities/admin';
import { Select, FilterPanel } from '@/shared/ui';

import style from './admin-customers-toolbar.module.scss';

const SORT_OPTIONS: { value: AdminCustomersSort; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'top_spenders', label: 'Top spenders' },
    { value: 'most_orders', label: 'Most orders' },
];

// Radix Select reserves an empty string value to mean "no selection" — 'all'
// is the sentinel mapped back to '' at the onValueChange boundary below.
const ROLE_OPTIONS = [
    { value: 'all', label: 'All roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'Customer' },
];

interface AdminCustomersToolbarProps {
    search: string;
    role: UserRole | '';
    sort: AdminCustomersSort;
    activeFilterCount: number;
    onSearchChange: (search: string) => void;
    onRoleChange: (role: UserRole | '') => void;
    onSortChange: (sort: AdminCustomersSort) => void;
}

export const AdminCustomersToolbar = ({
    search,
    role,
    sort,
    activeFilterCount,
    onSearchChange,
    onRoleChange,
    onSortChange,
}: AdminCustomersToolbarProps) => {
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
                <form className={style['admin-customers-toolbar__search']} onSubmit={handleSubmit}>
                    <IoSearchOutline className={style['admin-customers-toolbar__search-icon']} aria-hidden="true" />
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search by name, username or email"
                        aria-label="Search by name, username or email"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            className={style['admin-customers-toolbar__clear']}
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
                label="Role"
                value={role || 'all'}
                options={ROLE_OPTIONS}
                onValueChange={(value) => onRoleChange(value === 'all' ? '' : (value as UserRole))}
            />

            <Select
                variant="toolbar"
                label="Sort by"
                value={sort}
                options={SORT_OPTIONS}
                onValueChange={(value) => onSortChange(value as AdminCustomersSort)}
            />
        </FilterPanel>
    );
};
