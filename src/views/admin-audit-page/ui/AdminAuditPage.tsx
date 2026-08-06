import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { LuScrollText } from 'react-icons/lu';

import { useMediaQuery, usePaginationBounds } from '@/shared/lib/hooks';
import { scrollToTop, getErrorMessage } from '@/shared/lib';
import { SectionHeader, Pagination, EmptyState, Alert } from '@/shared/ui';
import { useGetAdminAuditLogQuery, useGetAdminCustomersQuery, AuditLogList } from '@/entities/admin';

import { AdminAuditToolbar } from './components';

const ADMIN_OPTIONS_LIMIT = 100;

export const AdminAuditPage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [searchParams, setSearchParams] = useSearchParams();

    const action = searchParams.get('action') ?? '';
    const entityType = searchParams.get('entity') ?? '';
    const actorId = searchParams.get('actor') ?? '';

    const [page, setPage] = useState(1);
    const limit = isMobile ? 8 : 15;

    useEffect(() => {
        setPage(1);
    }, [isMobile]);

    const { data, isLoading, error } = useGetAdminAuditLogQuery({
        page,
        limit,
        action: action || undefined,
        entityType: entityType || undefined,
        actorId: actorId || undefined,
    });

    const entries = data?.items ?? [];
    const totalCount = data?.totalCount ?? 0;

    usePaginationBounds(page, totalCount, limit, setPage, error);

    // Reuses the customer list's existing role filter — no new endpoint
    // needed just to populate the "admin" dropdown.
    const { data: adminsData } = useGetAdminCustomersQuery({ page: 1, limit: ADMIN_OPTIONS_LIMIT, role: 'admin' });
    const adminOptions = (adminsData?.items ?? []).map((admin) => ({ value: admin.id, label: admin.username }));

    const handleActionChange = useCallback((next: string) => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('action', next); else params.delete('action');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handleEntityTypeChange = useCallback((next: string) => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('entity', next); else params.delete('entity');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handleActorIdChange = useCallback((next: string) => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('actor', next); else params.delete('actor');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handleResetFilters = useCallback(() => {
        setPage(1);
        setSearchParams((params) => {
            params.delete('action');
            params.delete('entity');
            params.delete('actor');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        scrollToTop();
    }, []);

    const activeFilterCount = [!!action, !!entityType, !!actorId].filter(Boolean).length;

    return (
        <>
            <SectionHeader
                title="Audit log"
                subtitle="Every admin action recorded across the store."
            />

            <AdminAuditToolbar
                action={action}
                entityType={entityType}
                actorId={actorId}
                adminOptions={adminOptions}
                activeFilterCount={activeFilterCount}
                onActionChange={handleActionChange}
                onEntityTypeChange={handleEntityTypeChange}
                onActorIdChange={handleActorIdChange}
                onResetFilters={handleResetFilters}
            />

            {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            {!isLoading && entries.length === 0 ? (
                <EmptyState
                    icon={<LuScrollText />}
                    title={activeFilterCount > 0 ? 'No matching entries' : 'No activity yet'}
                    text={activeFilterCount > 0
                        ? 'Try a different filter combination.'
                        : 'Admin actions across the store will show up here.'}
                />
            ) : (
                <AuditLogList entries={entries} isLoading={isLoading} limit={limit} />
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
