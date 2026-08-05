import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import Skeleton from 'react-loading-skeleton';
import { LuPackage } from 'react-icons/lu';

import { useGetAdminTopProductsQuery } from '@/entities/admin';
import { Alert, EmptyState, PanelCard, SegmentedTabs, type SegmentedTabItem } from '@/shared/ui';
import { formatPrice, getErrorMessage } from '@/shared/lib';

import style from './admin-top-products-panel.module.scss';

type TopProductsMetric = 'units' | 'revenue';

const METRIC_ITEMS: SegmentedTabItem<TopProductsMetric>[] = [
    { id: 'units', label: 'Units' },
    { id: 'revenue', label: 'Revenue' },
];

const TOP_PRODUCTS_LIMIT = 5;

export const AdminTopProductsPanel = () => {
    const [metric, setMetric] = useState<TopProductsMetric>('units');
    const { data, isLoading, error } = useGetAdminTopProductsQuery(TOP_PRODUCTS_LIMIT);

    const products = useMemo(() => {
        const items = data ?? [];
        // The RPC sorts by units_sold desc; re-sort client-side for the
        // revenue view — both numbers are already in each row, no new RPC arg needed.
        return metric === 'revenue' ? [...items].sort((a, b) => b.revenue - a.revenue) : items;
    }, [data, metric]);

    return (
        <PanelCard
            title="Top products"
            action={
                <SegmentedTabs
                    items={METRIC_ITEMS}
                    value={metric}
                    onChange={setMetric}
                    idPrefix="top-products-metric"
                    ariaLabel="Rank by"
                    size="sm"
                />
            }
            to="/admin/products"
        >
            {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            {isLoading ? (
                <div className={style['admin-top-products-panel__list']}>
                    {Array.from({ length: TOP_PRODUCTS_LIMIT }).map((_, index) => (
                        <div key={index} className={style['admin-top-products-panel__row']}>
                            <Skeleton width={40} height={40} borderRadius={8} />
                            <Skeleton width={140} height={16} />
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <EmptyState icon={<LuPackage />} title="No sales yet" text="Products that sell will show up here." />
            ) : (
                <div className={style['admin-top-products-panel__list']}>
                    {products.map((product) => (
                        <Link
                            key={product.productId}
                            to={`/admin/products/${product.productId}/edit`}
                            className={style['admin-top-products-panel__row']}
                        >
                            <img
                                className={style['admin-top-products-panel__thumbnail']}
                                src={product.thumbnail ?? undefined}
                                alt=""
                                aria-hidden="true"
                                loading="lazy"
                                decoding="async"
                            />
                            <span className={style['admin-top-products-panel__title']}>{product.title}</span>
                            <span
                                className={`${style['admin-top-products-panel__metric']} ${metric === 'units' ? style['admin-top-products-panel__metric--active'] : ''}`}
                            >
                                {product.unitsSold} {product.unitsSold === 1 ? 'unit' : 'units'}
                            </span>
                            <span
                                className={`${style['admin-top-products-panel__metric']} ${metric === 'revenue' ? style['admin-top-products-panel__metric--active'] : ''}`}
                            >
                                {formatPrice(product.revenue)}
                            </span>
                        </Link>
                    ))}
                </div>
            )}
        </PanelCard>
    );
};
