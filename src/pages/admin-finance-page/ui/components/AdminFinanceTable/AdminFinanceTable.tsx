import { LuTable } from 'react-icons/lu';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { useGetAdminFinanceBreakdownQuery, useGetAdminFinanceSeriesQuery, useGetAdminFinanceSummaryQuery } from '@/entities/admin';
import { Alert, EmptyState } from '@/shared/ui';
import { formatDate, formatPrice, getErrorMessage } from '@/shared/lib';

import style from './admin-finance-table.module.scss';

interface AdminFinanceTableProps {
    days: number;
}

export const AdminFinanceTable = ({ days }: AdminFinanceTableProps) => {
    const { data: series, isLoading: isSeriesLoading, error: seriesError } = useGetAdminFinanceSeriesQuery(days);
    const { data: summary, isLoading: isSummaryLoading, error: summaryError } = useGetAdminFinanceSummaryQuery(days);
    const { data: breakdown, isLoading: isBreakdownLoading, error: breakdownError } = useGetAdminFinanceBreakdownQuery(days);

    const isLoading = isSeriesLoading || isSummaryLoading || isBreakdownLoading;
    const error = seriesError ?? summaryError ?? breakdownError;
    // The dry-numbers view is for scanning real activity, not for confirming
    // a day had zero orders — the chart view's continuous axis is where the
    // gaps belong.
    const rows = (series ?? []).filter((row) => row.ordersCount > 0);

    if (!isLoading && (summary?.paidOrders ?? 0) === 0) {
        return (
            <EmptyState
                icon={<LuTable />}
                title="No revenue yet"
                text={`No paid orders in the last ${days} days.`}
            />
        );
    }

    return (
        <div className={style['admin-finance-table']}>
            {!!error && <Alert variant="error">{getErrorMessage(error)}</Alert>}

            <section aria-label="Daily breakdown">
                <div className={style['admin-finance-table__grid']} role="table">
                    <div className={style['admin-finance-table__header']} role="row">
                        <span role="columnheader">Date</span>
                        <span role="columnheader">Orders</span>
                        <span role="columnheader">Subtotal</span>
                        <span role="columnheader">Delivery</span>
                        <span role="columnheader">Fees</span>
                        <span role="columnheader">Refunded</span>
                        <span role="columnheader">Gross</span>
                    </div>

                    {isLoading ? (
                        Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className={style['admin-finance-table__row']} role="row">
                                {Array.from({ length: 7 }).map((__, cell) => (
                                    <span key={cell} role="cell"><Skeleton height={16} /></span>
                                ))}
                            </div>
                        ))
                    ) : (
                        rows.map((row) => {
                            const gross = row.itemsSubtotal + row.deliveryCost + row.paymentFee;
                            return (
                                <div key={row.day} className={style['admin-finance-table__row']} role="row">
                                    <span role="cell">{formatDate(row.day, 'compact')}</span>
                                    <span role="cell">{row.ordersCount}</span>
                                    <span role="cell">{formatPrice(row.itemsSubtotal)}</span>
                                    <span role="cell">{formatPrice(row.deliveryCost)}</span>
                                    <span role="cell">{formatPrice(row.paymentFee)}</span>
                                    <span role="cell">{formatPrice(row.refunded)}</span>
                                    <span role="cell">{formatPrice(gross)}</span>
                                </div>
                            );
                        })
                    )}

                    {!isLoading && summary && (
                        <div className={`${style['admin-finance-table__row']} ${style['admin-finance-table__row--total']}`} role="row">
                            <span role="cell">Total</span>
                            <span role="cell">{summary.paidOrders}</span>
                            <span role="cell">{formatPrice(summary.itemsSubtotal)}</span>
                            <span role="cell">{formatPrice(summary.deliveryCollected)}</span>
                            <span role="cell">{formatPrice(summary.paymentFees)}</span>
                            <span role="cell">{formatPrice(summary.refundedAmount)}</span>
                            <span role="cell">{formatPrice(summary.grossCollected)}</span>
                        </div>
                    )}
                </div>
            </section>

            {!isLoading && !!breakdown?.paymentMethods.length && (
                <section aria-label="Payment methods">
                    <h3 className={style['admin-finance-table__subheading']}>Payment methods</h3>
                    <div className={style['admin-finance-table__grid--breakdown']} role="table">
                        <div className={style['admin-finance-table__header']} role="row">
                            <span role="columnheader">Method</span>
                            <span role="columnheader">Orders</span>
                            <span role="columnheader">Gross</span>
                            <span role="columnheader">Fees</span>
                        </div>
                        {breakdown.paymentMethods.map((method) => (
                            <div key={method.code} className={style['admin-finance-table__row']} role="row">
                                <span role="cell">{method.name}</span>
                                <span role="cell">{method.ordersCount}</span>
                                <span role="cell">{formatPrice(method.gross)}</span>
                                <span role="cell">{formatPrice(method.fees)}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {!isLoading && !!breakdown?.deliveryMethods.length && (
                <section aria-label="Delivery methods">
                    <h3 className={style['admin-finance-table__subheading']}>Delivery methods</h3>
                    <div className={style['admin-finance-table__grid--breakdown']} role="table">
                        <div className={style['admin-finance-table__header']} role="row">
                            <span role="columnheader">Method</span>
                            <span role="columnheader">Orders</span>
                            <span role="columnheader">Collected</span>
                            <span role="columnheader">Subsidized</span>
                        </div>
                        {breakdown.deliveryMethods.map((method) => (
                            <div key={method.code} className={style['admin-finance-table__row']} role="row">
                                <span role="cell">{method.name}</span>
                                <span role="cell">{method.ordersCount}</span>
                                <span role="cell">{formatPrice(method.collected)}</span>
                                <span role="cell">{formatPrice(method.subsidy)}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
