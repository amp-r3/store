import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { LuClipboardList } from 'react-icons/lu';

import { useMediaQuery, useHaptics } from '@/shared/lib/hooks';
import { usePaginationBounds } from '@/shared/lib/hooks';
import { scrollToTop, getErrorMessage } from '@/shared/lib';
import { SectionHeader, Pagination, EmptyState, Alert } from '@/shared/ui';
import { AdminOrderStatusFilter, useEnrichedOrderItems } from '@/entities/order';
import { useGetAllOrdersQuery, useGetOrderStatusTransitionsQuery, useGetAdminOrderByIdQuery } from '@/entities/admin';
import { AdminOrderDetails } from '@/widgets/admin-order-details';

import { AdminOrdersToolbar, AdminOrdersTable } from './components';

export const AdminOrdersPage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { soft } = useHaptics();
    const [searchParams, setSearchParams] = useSearchParams();

    const status = (searchParams.get('status') as AdminOrderStatusFilter | null) ?? 'all';
    const search = searchParams.get('q') ?? '';
    const dateFrom = searchParams.get('from') ?? '';
    const dateTo = searchParams.get('to') ?? '';
    const orderId = searchParams.get('order');

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
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
    });

    const { data: transitions } = useGetOrderStatusTransitionsQuery();

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

    const handleDateFromChange = useCallback((next: string) => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('from', next); else params.delete('from');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handleDateToChange = useCallback((next: string) => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('to', next); else params.delete('to');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handleResetFilters = useCallback(() => {
        setPage(1);
        setSearchParams((params) => {
            params.delete('status');
            params.delete('q');
            params.delete('from');
            params.delete('to');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        scrollToTop();
    }, []);

    const openOrderDetails = useCallback((id: string) => {
        soft();
        setSearchParams((params) => {
            params.set('order', id);
            return params;
        });
    }, [setSearchParams, soft]);

    /** Drops `?order` without a haptic — also used to recover from a dead deep link. */
    const clearOrderParam = useCallback(() => {
        setSearchParams((params) => {
            params.delete('order');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const closeOrderDetails = useCallback(() => {
        soft();
        clearOrderParam();
    }, [clearOrderParam, soft]);

    const orderFromList = orders.find((order) => order.id === orderId);
    const orderByIdResult = useGetAdminOrderByIdQuery(orderId ?? '', { skip: !orderId || !!orderFromList });
    const activeOrder = orderFromList ?? orderByIdResult.data;

    useEffect(() => {
        if (orderId && !orderFromList && orderByIdResult.isError) {
            clearOrderParam();
        }
    }, [orderId, orderFromList, orderByIdResult.isError, clearOrderParam]);

    const {
        items,
        isLoading: isItemsLoading,
        isFetching: isItemsFetching,
    } = useEnrichedOrderItems(activeOrder?.orderItems ?? []);

    const hasActiveFilter = status !== 'all' || !!search || !!dateFrom || !!dateTo;

    return (
        <>
            <SectionHeader
                title="Orders"
                subtitle="Every order placed in the store."
            />

            <AdminOrdersToolbar
                status={status}
                search={search}
                dateFrom={dateFrom}
                dateTo={dateTo}
                hasActiveFilter={hasActiveFilter}
                onStatusChange={handleStatusChange}
                onSearchChange={handleSearchChange}
                onDateFromChange={handleDateFromChange}
                onDateToChange={handleDateToChange}
                onResetFilters={handleResetFilters}
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
                    transitions={transitions}
                    onOpenDetails={openOrderDetails}
                />
            )}

            <Pagination
                totalItems={totalCount}
                currentPage={page}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
            />

            {activeOrder && (
                <AdminOrderDetails
                    open={!!orderId}
                    onOpenChange={closeOrderDetails}
                    order={activeOrder}
                    isFetching={orderByIdResult.isFetching}
                    items={items}
                    isItemsFetching={isItemsFetching}
                    isItemsLoading={isItemsLoading}
                />
            )}
        </>
    );
};
