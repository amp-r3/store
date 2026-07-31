import { useCallback, useState } from 'react';
import { LuInfo } from 'react-icons/lu';

import { useMediaQuery } from '@/shared/lib/hooks';
import { usePaginationBounds } from '@/shared/lib/hooks';
import { scrollToTop } from '@/shared/lib';
import { SectionHeader, Pagination, InfoBanner } from '@/shared/ui';
import { useGetProductsQuery, getItemsToRender } from '@/entities/product';

import { AdminProductsTable } from './components';

export const AdminProductsPage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [page, setPage] = useState(1);
    const limit = isMobile ? 8 : 12;

    const { data, isLoading, error } = useGetProductsQuery({ page, limit });
    const products = getItemsToRender(data, isLoading, limit);
    const totalCount = data?.total ?? 0;

    usePaginationBounds(page, totalCount, limit, setPage, error);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        scrollToTop();
    }, []);

    return (
        <>
            <SectionHeader
                title="Products"
                subtitle="Every product currently in the catalog."
            />

            <InfoBanner
                icon={<LuInfo />}
                title="Read-only in this release"
                description="Product editing, images and stock management are coming in a later update."
                details={[]}
            />

            <AdminProductsTable
                products={products}
                isLoading={isLoading}
                limit={limit}
            />

            <Pagination
                totalItems={totalCount}
                currentPage={page}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
            />
        </>
    );
};
