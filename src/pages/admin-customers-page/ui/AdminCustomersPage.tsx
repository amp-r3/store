import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { LuUsers } from 'react-icons/lu';

import { useMediaQuery } from '@/shared/lib/hooks';
import { usePaginationBounds } from '@/shared/lib/hooks';
import { scrollToTop, getErrorMessage } from '@/shared/lib';
import { SectionHeader, Pagination, EmptyState, Alert } from '@/shared/ui';
import { selectUser } from '@/entities/session';
import { useAppSelector } from '@/shared/model';
import { AdminCustomer, AdminCustomersSort, UserRole, useGetAdminCustomersQuery } from '@/entities/admin';

import { AdminCustomersToolbar, AdminCustomersTable, AdminCustomerRoleModal } from './components';

export const AdminCustomersPage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const currentUser = useAppSelector(selectUser);
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('q') ?? '';
    const role = (searchParams.get('role') as UserRole | null) ?? '';
    const sort = (searchParams.get('sort') as AdminCustomersSort | null) ?? 'newest';

    const [page, setPage] = useState(1);
    const limit = isMobile ? 8 : 15;

    useEffect(() => {
        setPage(1);
    }, [isMobile]);

    const { data, isLoading, error } = useGetAdminCustomersQuery({
        page,
        limit,
        search: search || undefined,
        role: role || undefined,
        sort,
    });

    const customers = data?.items ?? [];
    const totalCount = data?.totalCount ?? 0;

    usePaginationBounds(page, totalCount, limit, setPage, error);

    const [changingRoleCustomer, setChangingRoleCustomer] = useState<AdminCustomer | null>(null);

    const handleSearchChange = useCallback((next: string) => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('q', next); else params.delete('q');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handleRoleChange = useCallback((next: UserRole | '') => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('role', next); else params.delete('role');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handleSortChange = useCallback((next: AdminCustomersSort) => {
        setPage(1);
        setSearchParams((params) => {
            if (next !== 'newest') params.set('sort', next); else params.delete('sort');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        scrollToTop();
    }, []);

    const hasActiveFilter = !!search || !!role;

    return (
        <>
            <SectionHeader
                title="Customers"
                subtitle="Everyone who's registered in the store."
            />

            <AdminCustomersToolbar
                search={search}
                role={role}
                sort={sort}
                onSearchChange={handleSearchChange}
                onRoleChange={handleRoleChange}
                onSortChange={handleSortChange}
            />

            {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            {!isLoading && customers.length === 0 ? (
                <EmptyState
                    icon={<LuUsers />}
                    title={hasActiveFilter ? 'No matching customers' : 'No customers yet'}
                    text={hasActiveFilter
                        ? 'Try a different search term or role filter.'
                        : 'Customers who register will show up here.'}
                />
            ) : (
                <AdminCustomersTable
                    customers={customers}
                    isLoading={isLoading}
                    limit={limit}
                    currentUserId={currentUser?.id ?? null}
                    onChangeRole={setChangingRoleCustomer}
                />
            )}

            <Pagination
                totalItems={totalCount}
                currentPage={page}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
            />

            <AdminCustomerRoleModal
                isOpen={!!changingRoleCustomer}
                onOpenChange={(open) => { if (!open) setChangingRoleCustomer(null); }}
                customer={changingRoleCustomer}
            />
        </>
    );
};
