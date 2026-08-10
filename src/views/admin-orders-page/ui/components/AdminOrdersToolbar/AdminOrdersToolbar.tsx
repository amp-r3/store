import { FormEvent, useEffect, useState } from 'react';
import { IoClose, IoSearchOutline } from 'react-icons/io5';

import { useDebounce } from '@/shared/lib/hooks';
import { AdminOrderStatusFilter, ORDER_STATUS_OPTIONS, ORDER_STATUS_MAP } from '@/entities/order';
import { Select, FilterPanel } from '@/shared/ui';

import style from './admin-orders-toolbar.module.scss';

const STATUS_SELECT_OPTIONS = [
  { value: 'all', label: 'All' },
  ...ORDER_STATUS_OPTIONS.map((option) => ({
    value: option,
    label: ORDER_STATUS_MAP[option]?.label ?? option,
  })),
];

interface AdminOrdersToolbarProps {
  status: AdminOrderStatusFilter;
  search: string;
  dateFrom: string;
  dateTo: string;
  activeFilterCount: number;
  onStatusChange: (status: AdminOrderStatusFilter) => void;
  onSearchChange: (search: string) => void;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onResetFilters: () => void;
}

export const AdminOrdersToolbar = ({
  status,
  search,
  dateFrom,
  dateTo,
  activeFilterCount,
  onStatusChange,
  onSearchChange,
  onDateFromChange,
  onDateToChange,
  onResetFilters,
}: AdminOrdersToolbarProps) => {
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
      search={
        <form className={style['admin-orders-toolbar__search']} onSubmit={handleSubmit}>
          <IoSearchOutline
            className={style['admin-orders-toolbar__search-icon']}
            aria-hidden="true"
          />
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
      }
    >
      <Select
        variant="toolbar"
        label="Status"
        value={status}
        options={STATUS_SELECT_OPTIONS}
        onValueChange={(value) => onStatusChange(value as AdminOrderStatusFilter)}
      />

      <label className={style['admin-orders-toolbar__filter']}>
        <span>From</span>
        <input
          type="date"
          value={dateFrom}
          max={dateTo || undefined}
          onChange={(event) => onDateFromChange(event.target.value)}
          aria-label="From date"
        />
      </label>

      <label className={style['admin-orders-toolbar__filter']}>
        <span>To</span>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(event) => onDateToChange(event.target.value)}
          aria-label="To date"
        />
      </label>

      {activeFilterCount > 0 && (
        <button
          type="button"
          className={style['admin-orders-toolbar__reset']}
          onClick={onResetFilters}
        >
          Reset filters
        </button>
      )}
    </FilterPanel>
  );
};
