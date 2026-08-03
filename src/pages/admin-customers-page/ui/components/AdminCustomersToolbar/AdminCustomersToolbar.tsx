import { FormEvent, useEffect, useState } from 'react';
import { IoClose, IoSearchOutline } from 'react-icons/io5';

import { useDebounce } from '@/shared/lib/hooks';
import { AdminCustomersSort, UserRole } from '@/entities/admin';
import { Select } from '@/shared/ui';

import style from './admin-customers-toolbar.module.scss';

const SORT_OPTIONS: { value: AdminCustomersSort; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'top_spenders', label: 'Top spenders' },
    { value: 'most_orders', label: 'Most orders' },
];

const ROLE_OPTIONS = [
    { value: '', label: 'All roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'Customer' },
];

interface AdminCustomersToolbarProps {
    search: string;
    role: UserRole | '';
    sort: AdminCustomersSort;
    onSearchChange: (search: string) => void;
    onRoleChange: (role: UserRole | '') => void;
    onSortChange: (sort: AdminCustomersSort) => void;
}

export const AdminCustomersToolbar = ({
    search,
    role,
    sort,
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
        <div className={style['admin-customers-toolbar']}>
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

            <Select
                variant="toolbar"
                label="Role"
                value={role}
                options={ROLE_OPTIONS}
                onChange={(event) => onRoleChange(event.target.value as UserRole | '')}
            />

            <Select
                variant="toolbar"
                label="Sort by"
                value={sort}
                options={SORT_OPTIONS}
                onChange={(event) => onSortChange(event.target.value as AdminCustomersSort)}
            />
        </div>
    );
};
