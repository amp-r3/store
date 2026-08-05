import { useCallback, useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { LuPackage, LuPlus } from 'react-icons/lu';

import { useMediaQuery } from '@/shared/lib/hooks';
import { usePaginationBounds } from '@/shared/lib/hooks';
import { scrollToTop, getErrorMessage } from '@/shared/lib';
import { SectionHeader, Pagination, Alert, EmptyState } from '@/shared/ui';
import { AdminProductListItem, useGetAdminProductsQuery, useArchiveAdminProductMutation } from '@/entities/admin';

import { AdminProductsTable, AdminProductsToolbar, AdminProductArchiveModal } from './components';
import style from './admin-products-page.module.scss';

export const AdminProductsPage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('q') ?? '';
    const includeArchived = searchParams.get('archived') === '1';

    const [page, setPage] = useState(1);
    const limit = isMobile ? 8 : 12;

    useEffect(() => {
        setPage(1);
    }, [isMobile]);

    const { data, isLoading, error } = useGetAdminProductsQuery({
        page,
        limit,
        search: search || undefined,
        includeArchived,
    });

    const products = data?.items ?? [];
    const totalCount = data?.totalCount ?? 0;

    usePaginationBounds(page, totalCount, limit, setPage, error);

    const [restoreProduct] = useArchiveAdminProductMutation();
    const [archivingProduct, setArchivingProduct] = useState<AdminProductListItem | null>(null);

    const handleSearchChange = useCallback((next: string) => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('q', next); else params.delete('q');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handleIncludeArchivedChange = useCallback((next: boolean) => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('archived', '1'); else params.delete('archived');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        scrollToTop();
    }, []);

    const handleRestore = useCallback((product: AdminProductListItem) => {
        restoreProduct({ id: product.id, archived: false });
    }, [restoreProduct]);

    const hasActiveFilter = !!search || includeArchived;
    // Search is always visible above the panel — only the collapsed
    // filter (archived toggle) counts toward the disclosure's badge.
    const activeFilterCount = includeArchived ? 1 : 0;

    return (
        <>
            <SectionHeader
                title="Products"
                subtitle="Every product currently in the catalog."
                action={<Link to="/admin/products/new" className={style['admin-products-page__new-link']}><LuPlus /> New product</Link>}
            />

            <AdminProductsToolbar
                search={search}
                includeArchived={includeArchived}
                activeFilterCount={activeFilterCount}
                onSearchChange={handleSearchChange}
                onIncludeArchivedChange={handleIncludeArchivedChange}
            />

            {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            {!isLoading && products.length === 0 ? (
                <EmptyState
                    icon={<LuPackage />}
                    title={hasActiveFilter ? 'No matching products' : 'No products yet'}
                    text={hasActiveFilter
                        ? 'Try a different search term or toggle archived products.'
                        : 'Products added to the catalog will show up here.'}
                />
            ) : (
                <AdminProductsTable
                    products={products}
                    isLoading={isLoading}
                    limit={limit}
                    onArchive={setArchivingProduct}
                    onRestore={handleRestore}
                />
            )}

            <Pagination
                totalItems={totalCount}
                currentPage={page}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
            />

            <AdminProductArchiveModal
                isOpen={!!archivingProduct}
                onOpenChange={(open) => { if (!open) setArchivingProduct(null); }}
                product={archivingProduct}
            />
        </>
    );
};
