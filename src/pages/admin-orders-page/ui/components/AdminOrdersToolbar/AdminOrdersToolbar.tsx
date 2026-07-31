import { FormEvent, useEffect, useState } from 'react';
import { IoClose, IoSearchOutline } from 'react-icons/io5';

import { AdminOrderStatusFilter, ORDER_STATUS_OPTIONS, ORDER_STATUS_MAP } from '@/entities/order';

import style from './admin-orders-toolbar.module.scss';

interface AdminOrdersToolbarProps {
    status: AdminOrderStatusFilter;
    search: string;
    onStatusChange: (status: AdminOrderStatusFilter) => void;
    onSearchChange: (search: string) => void;
}

export const AdminOrdersToolbar = ({ status, search, onStatusChange, onSearchChange }: AdminOrdersToolbarProps) => {
    const [searchInput, setSearchInput] = useState(search);

    // Keep the input in sync with the URL (e.g. a browser back/forward nav
    // that changes ?q= without going through handleSubmit/handleClear below).
    useEffect(() => {
        setSearchInput(search);
    }, [search]);

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        onSearchChange(searchInput.trim());
    };

    const handleClear = () => {
        setSearchInput('');
        onSearchChange('');
    };

    return (
        <div className={style['admin-orders-toolbar']}>
            <label className={style['admin-orders-toolbar__filter']}>
                <span>Status</span>
                <select
                    value={status}
                    onChange={(event) => onStatusChange(event.target.value as AdminOrderStatusFilter)}
                >
                    <option value="all">All</option>
                    {ORDER_STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                            {ORDER_STATUS_MAP[option]?.label ?? option}
                        </option>
                    ))}
                </select>
            </label>

            <form className={style['admin-orders-toolbar__search']} onSubmit={handleSubmit}>
                <IoSearchOutline className={style['admin-orders-toolbar__search-icon']} aria-hidden="true" />
                <input
                    type="search"
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search by order number"
                    aria-label="Search by order number"
                />
                {searchInput && (
                    <button
                        type="button"
                        className={style['admin-orders-toolbar__clear']}
                        onClick={handleClear}
                        aria-label="Clear search"
                    >
                        <IoClose />
                    </button>
                )}
            </form>
        </div>
    );
};
