import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { IoClose, IoSearchOutline } from 'react-icons/io5';
import { LuTriangleAlert } from 'react-icons/lu';

import { useDebounce } from '@/shared/lib/hooks';
import { Switch } from '@/shared/ui';

import style from './admin-products-toolbar.module.scss';

interface AdminProductsToolbarProps {
    search: string;
    includeArchived: boolean;
    onSearchChange: (search: string) => void;
    onIncludeArchivedChange: (includeArchived: boolean) => void;
}

export const AdminProductsToolbar = ({ search, includeArchived, onSearchChange, onIncludeArchivedChange }: AdminProductsToolbarProps) => {
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
        <div className={style['admin-products-toolbar']}>
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

            <Switch
                label="Show archived"
                checked={includeArchived}
                onChange={onIncludeArchivedChange}
            />

            <Link to="/admin/products/low-stock" className={style['admin-products-toolbar__low-stock-link']}>
                <LuTriangleAlert /> Low stock
            </Link>
        </div>
    );
};
