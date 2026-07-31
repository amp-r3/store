import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { LuClipboardList } from 'react-icons/lu';

import { useMediaQuery } from '@/shared/lib/hooks';
import { usePaginationBounds } from '@/shared/lib/hooks';
import { scrollToTop, getErrorMessage } from '@/shared/lib';
import { SectionHeader, Pagination, EmptyState, Alert } from '@/shared/ui';
import { AdminOrderStatusFilter } from '@/entities/order';
import { useGetAllOrdersQuery } from '@/entities/admin';

import { AdminOrdersToolbar, AdminOrdersTable } from './components';

const formatOrderDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export const AdminOrdersPage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [searchParams, setSearchParams] = useSearchParams();

    const status = (searchParams.get('status') as AdminOrderStatusFilter | null) ?? 'all';
    const search = searchParams.get('q') ?? '';

    const [page, setPage] = useState(1);
    const limit = isMobile ? 8 : 15;

    /** Row density differs by breakpoint, so crossing it mid-list must restart paging. */
    useEffect(() => {
        setPage(1);
    }, [isMobile]);

    const { data, isLoading, error } = useGetAllOrdersQuery({
        page,
        limit,
        status,
        search: search || undefined,
    });

    const orders = useMemo(() => data?.items ?? [], [data]);
    const totalCount = data?.totalCount ?? 0;

    usePaginationBounds(page, totalCount, limit, setPage, error);

    const handleStatusChange = useCallback((next: AdminOrderStatusFilter) => {
        setPage(1);
        setSearchParams((params) => {
            if (next === 'all') params.delete('status'); else params.set('status', next);
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handleSearchChange = useCallback((next: string) => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('q', next); else params.delete('q');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        scrollToTop();
    }, []);

    const hasActiveFilter = status !== 'all' || !!search;

    return (
        <>
            <SectionHeader
                title="Orders"
                subtitle="Every order placed in the store."
            />

            <AdminOrdersToolbar
                status={status}
                search={search}
                onStatusChange={handleStatusChange}
                onSearchChange={handleSearchChange}
            />

            {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            {!isLoading && orders.length === 0 ? (
                <EmptyState
                    icon={<LuClipboardList />}
                    title={hasActiveFilter ? 'No matching orders' : 'No orders yet'}
                    text={hasActiveFilter
                        ? 'Try a different status filter or search term.'
                        : 'Orders placed by customers will show up here.'}
                />
            ) : (
                <AdminOrdersTable
                    orders={orders}
                    isLoading={isLoading}
                    limit={limit}
                    formatOrderDate={formatOrderDate}
                />
            )}

            <Pagination
                totalItems={totalCount}
                currentPage={page}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
            />
        </>
    );
};
