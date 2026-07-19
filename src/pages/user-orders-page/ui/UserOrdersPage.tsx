import { useMemo, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';

import { useAppDispatch } from '@/shared/model';
import { useMediaQuery, useHaptics } from '@/shared/lib/hooks';
import { scrollToTop } from '@/shared/lib';
import { OrdersList } from '@/widgets/orders-list';
import { OrderDetails } from '@/widgets/order-details';
import { CartProduct } from '@/entities/cart';
import { ReviewTargetPicker, openReviewModal } from '@/features/order-review';
import { useProductsByIds } from '@/entities/product';
import {
    useGetOrdersPaginationQuery,
    useGetOrdersScrollQuery,
    useGetOrderByIdQuery,
    useGetOrderCountsQuery,
    useEnrichedOrderItems,
    OrdersScope,
    EnrichedOrderItem,
} from '@/entities/order';

import { UserOrdersTabs, UserOrdersEmpty } from './components';
import style from './user-orders-page.module.scss';

const formatOrderDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export const UserOrdersPage = () => {
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery('(max-width: 768px)');
    const { soft } = useHaptics();
    const [searchParams, setSearchParams] = useSearchParams();

    const tab: OrdersScope = searchParams.get('tab') === 'completed' ? 'completed' : 'active';
    const orderId = searchParams.get('order');

    const [page, setPage] = useState(1);
    const limit = isMobile ? 8 : 10;

    const scrollResult = useGetOrdersScrollQuery({ page, limit, scope: tab }, { skip: isMobile });
    const paginationResult = useGetOrdersPaginationQuery({ page, limit, scope: tab }, { skip: !isMobile });
    const { data: counts } = useGetOrderCountsQuery();

    const ordersResponse = isMobile ? paginationResult.data : scrollResult.data;
    const isLoading = isMobile ? paginationResult.isLoading : scrollResult.isLoading;
    const isFetching = isMobile ? paginationResult.isFetching : scrollResult.isFetching;

    const orders = useMemo(() => ordersResponse?.items || [], [ordersResponse]);
    const totalCount = ordersResponse?.totalCount || 0;

    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewItems, setReviewItems] = useState<EnrichedOrderItem[]>([]);

    const handleTabChange = useCallback((next: OrdersScope) => {
        setPage(1);
        setSearchParams((params) => {
            if (next === 'completed') {
                params.set('tab', 'completed');
            } else {
                params.delete('tab');
            }
            params.delete('order');
            return params;
        }, { replace: true });
    }, [setSearchParams]);

    const openOrder = useCallback((id: string) => {
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

    const closeOrder = useCallback(() => {
        soft();
        clearOrderParam();
    }, [clearOrderParam, soft]);

    const loadMore = useCallback(() => setPage((prev) => prev + 1), []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
        scrollToTop();
    }, []);

    const orderFromList = orders.find((o) => o.id === orderId);
    const orderByIdResult = useGetOrderByIdQuery(orderId ?? '', { skip: !orderId || !!orderFromList });
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

    const orderCartProduct: CartProduct[] = items.map((item) => (
        { quantity: item.quantity, productId: item.product.id, sizeId: item.sizeId }
    ));

    const goodsTotal = activeOrder ? (
        Number(activeOrder.totalAmount) -
        Number(activeOrder.deliveryCost) -
        Number(activeOrder.paymentFee)
    ) : 0;

    const handleRateClick = () => {
        setReviewItems(items);
        if (isMobile) {
            closeOrder();
        }
        setIsReviewOpen(true);
    };

    const productIds = useMemo(
        () => Array.from(new Set(orders.flatMap((order) => order.orderItems.map((item) => item.productId)))),
        [orders]
    );

    const { products, isLoading: isProductsLoading } = useProductsByIds(productIds);

    const thumbnailsById = useMemo(
        () => products.reduce<Record<number, string>>((acc, product) => {
            acc[product.id] = product.thumbnail;
            return acc;
        }, {}),
        [products]
    );

    return (
        <>
            <header className={style.contentHeader}>
                <h1 className={style.title}>My Orders</h1>
                <p className={style.subtitle}>
                    Track active orders and look back at everything you&apos;ve completed.
                </p>
            </header>

            <UserOrdersTabs tab={tab} counts={counts} onChange={handleTabChange} />

            <div
                className={style.contentBody}
                role="tabpanel"
                id={`user-orders-panel-${tab}`}
                aria-labelledby={`user-orders-tab-${tab}`}
                aria-live="polite"
            >
                {!isLoading && orders.length === 0 ? (
                    <UserOrdersEmpty
                        variant={tab}
                        hasOtherTabOrders={tab === 'active' ? (counts?.completed ?? 0) > 0 : (counts?.active ?? 0) > 0}
                    />
                ) : (
                    <OrdersList
                        orders={orders}
                        totalItems={totalCount}
                        selectedOrderId={orderId}
                        currentPage={page}
                        itemsPerPage={limit}
                        thumbnailsById={isProductsLoading ? undefined : thumbnailsById}
                        formatOrderDate={formatOrderDate}
                        onCardClick={openOrder}
                        onPageChange={handlePageChange}
                        onLoadMore={loadMore}
                        hasMore={orders.length < totalCount}
                        isMobile={isMobile}
                        isLoading={isLoading}
                        isFetching={isFetching}
                    />
                )}
            </div>

            {activeOrder && (
                <OrderDetails
                    open={!!orderId}
                    onOpenChange={closeOrder}
                    order={activeOrder}
                    isFetching={isFetching}
                    items={items}
                    isItemsFetching={isItemsFetching}
                    isItemsLoading={isItemsLoading}
                    goodsTotal={goodsTotal}
                    formatOrderDate={formatOrderDate}
                    orderCartProduct={orderCartProduct}
                    onRateClick={handleRateClick}
                />
            )}

            <ReviewTargetPicker
                isOpen={isReviewOpen}
                onOpenChange={setIsReviewOpen}
                orderItems={reviewItems}
                isLoading={isItemsLoading}
                onAction={(item: EnrichedOrderItem) => {
                    setIsReviewOpen(false);
                    dispatch(openReviewModal(item.product.id.toString()));
                }}
            />
        </>
    );
};
