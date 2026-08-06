import Skeleton from 'react-loading-skeleton';

import { useGetAdminDeliveryMethodsQuery, useGetAdminPaymentMethodsQuery } from '@/entities/admin';
import { Alert, SectionHeader } from '@/shared/ui';
import { getErrorMessage } from '@/shared/lib';

import { AdminDeliveryMethodCard, AdminPaymentMethodCard } from './components';
import style from './admin-settings-page.module.scss';

export const AdminSettingsPage = () => {
    const deliveryQuery = useGetAdminDeliveryMethodsQuery();
    const paymentQuery = useGetAdminPaymentMethodsQuery();

    return (
        <>
            <SectionHeader
                title="Settings"
                subtitle="Delivery and payment methods used at checkout."
            />

            <section className={style['admin-settings-page__section']}>
                <div className={style['admin-settings-page__section-header']}>
                    <h2 className={style['admin-settings-page__section-title']}>Delivery methods</h2>
                    <p className={style['admin-settings-page__section-note']}>
                        The set of methods is fixed — new ones can&apos;t be added and existing ones can&apos;t be removed,
                        only edited or turned off.
                    </p>
                </div>

                {!!deliveryQuery.error && <Alert variant="error">{getErrorMessage(deliveryQuery.error)}</Alert>}

                <div className={style['admin-settings-page__grid']}>
                    {deliveryQuery.isLoading ? (
                        <>
                            <Skeleton height={260} borderRadius={18} />
                            <Skeleton height={260} borderRadius={18} />
                            <Skeleton height={260} borderRadius={18} />
                        </>
                    ) : (
                        (deliveryQuery.data ?? []).map((method) => (
                            <AdminDeliveryMethodCard key={method.id} method={method} />
                        ))
                    )}
                </div>
            </section>

            <section className={style['admin-settings-page__section']}>
                <div className={style['admin-settings-page__section-header']}>
                    <h2 className={style['admin-settings-page__section-title']}>Payment methods</h2>
                    <p className={style['admin-settings-page__section-note']}>
                        Same rule here — the method set is fixed by the database, only fees, name and activity change.
                    </p>
                </div>

                {!!paymentQuery.error && <Alert variant="error">{getErrorMessage(paymentQuery.error)}</Alert>}

                <div className={style['admin-settings-page__grid']}>
                    {paymentQuery.isLoading ? (
                        <>
                            <Skeleton height={260} borderRadius={18} />
                            <Skeleton height={260} borderRadius={18} />
                            <Skeleton height={260} borderRadius={18} />
                        </>
                    ) : (
                        (paymentQuery.data ?? []).map((method) => (
                            <AdminPaymentMethodCard key={method.id} method={method} />
                        ))
                    )}
                </div>
            </section>
        </>
    );
};
