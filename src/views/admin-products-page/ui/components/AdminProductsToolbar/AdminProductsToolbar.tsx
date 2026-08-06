import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { IoClose, IoSearchOutline } from 'react-icons/io5';
import { LuTriangleAlert } from 'react-icons/lu';

import { useDebounce } from '@/shared/lib/hooks';
import { Switch, FilterPanel } from '@/shared/ui';

import style from './admin-products-toolbar.module.scss';

interface AdminProductsToolbarProps {
    search: string;
    includeArchived: boolean;
    activeFilterCount: number;
    onSearchChange: (search: string) => void;
    onIncludeArchivedChange: (includeArchived: boolean) => void;
}

export const AdminProductsToolbar = ({ search, includeArchived, activeFilterCount, onSearchChange, onIncludeArchivedChange }: AdminProductsToolbarProps) => {
    const [searchInput, setSearchInput] = useState(search);
    const debouncedSearch = useDebounce(searchInput.trim(), 300);

    useEffect(() => {
        setSearchInput(search);
    }, [search]);

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
                <form className={style['admin-products-toolbar__search']} onSubmit={handleSubmit}>
                    <IoSearchOutline className={style['admin-products-toolbar__search-icon']} aria-hidden="true" />
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search by title"
                        aria-label="Search by title"
                    />
                    {searchInput && (
                        <button
                            type="button"
                            className={style['admin-products-toolbar__clear']}
                            onClick={handleClear}
                            aria-label="Clear search"
                        >
                            <IoClose />
                        </button>
                    )}
                </form>
            )}
            actions={(
                <Link href="/admin/products/low-stock" className={style['admin-products-toolbar__low-stock-link']}>
                    <LuTriangleAlert /> Low stock
                </Link>
            )}
        >
            <Switch
                label="Show archived"
                checked={includeArchived}
                onChange={onIncludeArchivedChange}
            />
        </FilterPanel>
    );
};
