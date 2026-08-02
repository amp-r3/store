import { useSearchParams } from 'react-router';
import { LuPackageSearch } from 'react-icons/lu';

import { getErrorMessage } from '@/shared/lib';
import { SectionHeader, Alert, EmptyState } from '@/shared/ui';
import { useGetAdminLowStockQuery } from '@/entities/admin';

import { AdminLowStockTable } from './components';
import style from './admin-low-stock-page.module.scss';

const DEFAULT_THRESHOLD = 5;

export const AdminLowStockPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const threshold = Number(searchParams.get('threshold')) || DEFAULT_THRESHOLD;

    const { data, isLoading, error } = useGetAdminLowStockQuery({ threshold });
    const items = data ?? [];

    const handleThresholdChange = (next: number) => {
        setSearchParams((params) => {
            if (next === DEFAULT_THRESHOLD) params.delete('threshold'); else params.set('threshold', String(next));
            return params;
        }, { replace: true });
    };

    return (
        <>
            <SectionHeader
                title="Low stock"
                subtitle="Sizes at or below the threshold, lowest first."
            />

            <label className={style['admin-low-stock-page__threshold']}>
                <span>Threshold</span>
                <input
                    type="number"
                    min={0}
                    step="1"
                    value={threshold}
                    onChange={(event) => handleThresholdChange(Math.max(0, Number(event.target.value) || 0))}
                />
            </label>

            {error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            {!isLoading && items.length === 0 ? (
                <EmptyState
                    icon={<LuPackageSearch />}
                    title="Stock levels look healthy"
                    text={`No size is at or below ${threshold} units right now.`}
                />
            ) : (
                <AdminLowStockTable items={items} isLoading={isLoading} />
            )}
        </>
    );
};
