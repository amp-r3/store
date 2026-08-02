import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { LuMessageSquare } from 'react-icons/lu';

import { useMediaQuery } from '@/shared/lib/hooks';
import { usePaginationBounds } from '@/shared/lib/hooks';
import { scrollToTop, getErrorMessage } from '@/shared/lib';
import { SectionHeader, Pagination, EmptyState, Alert } from '@/shared/ui';
import { AdminReview, AdminReviewSort, useGetAdminReviewsQuery } from '@/entities/admin';

import { AdminReviewsToolbar, AdminReviewsTable, AdminReviewDeleteModal } from './components';

export const AdminReviewsPage = () => {
    const isMobile = useMediaQuery('(max-width: 768px)');
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('q') ?? '';
    const ratingParam = searchParams.get('rating');
    const rating = ratingParam ? Number(ratingParam) : undefined;
    const sort = (searchParams.get('sort') as AdminReviewSort | null) ?? 'newest';

    const [page, setPage] = useState(1);
    const limit = isMobile ? 8 : 15;

    useEffect(() => {
        setPage(1);
    }, [isMobile]);

    const { data, isLoading, error } = useGetAdminReviewsQuery({
        page,
        limit,
        search: search || undefined,
        rating,
        sort,
    });

    const reviews = data?.items ?? [];
    const totalCount = data?.totalCount ?? 0;

    usePaginationBounds(page, totalCount, limit, setPage, error);

    const [deletingReview, setDeletingReview] = useState<AdminReview | null>(null);

    const handleSearchChange = useCallback((next: string) => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('q', next); else params.delete('q');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handleRatingChange = useCallback((next: number | undefined) => {
        setPage(1);
        setSearchParams((params) => {
            if (next) params.set('rating', String(next)); else params.delete('rating');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const handleSortChange = useCallback((next: AdminReviewSort) => {
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

    const hasActiveFilter = !!search || !!rating;

    return (
        <>
            <SectionHeader
                title="Reviews"
                subtitle="Every review left on a product in the store."
            />

            <AdminReviewsToolbar
                search={search}
                rating={rating}
                sort={sort}
                onSearchChange={handleSearchChange}
                onRatingChange={handleRatingChange}
                onSortChange={handleSortChange}
            />

            {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            {!isLoading && reviews.length === 0 ? (
                <EmptyState
                    icon={<LuMessageSquare />}
                    title={hasActiveFilter ? 'No matching reviews' : 'No reviews yet'}
                    text={hasActiveFilter
                        ? 'Try a different search term or rating filter.'
                        : 'Reviews left on products will show up here.'}
                />
            ) : (
                <AdminReviewsTable
                    reviews={reviews}
                    isLoading={isLoading}
                    limit={limit}
                    onDelete={setDeletingReview}
                />
            )}

            <Pagination
                totalItems={totalCount}
                currentPage={page}
                itemsPerPage={limit}
                onPageChange={handlePageChange}
            />

            <AdminReviewDeleteModal
                isOpen={!!deletingReview}
                onOpenChange={(open) => { if (!open) setDeletingReview(null); }}
                review={deletingReview}
            />
        </>
    );
};
