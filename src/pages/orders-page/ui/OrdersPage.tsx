import { OrderEmpty } from "./components";
import { ReviewTargetPicker } from "@/features/order-review";
import { useState, useEffect } from 'react';
import { useGetOrdersPaginationQuery, useGetOrdersScrollQuery } from '@/entities/order';
import style from './orders-page.module.scss';
import { Breadcrumbs } from '@/shared/ui';
import { OrderDetails, OrderDetailsSkeleton } from '@/widgets/order-details';
import { OrdersList } from '@/widgets/orders-list';
import { CartProduct } from '@/entities/cart';
import { useMediaQuery } from "@/shared/lib/hooks";
import { scrollToTop } from "@/shared/lib";
import { useEnrichedOrderItems } from "@/entities/order";
import { useAppDispatch } from "@/shared/model";
import { openReviewModal } from "@/features/order-review";
import { EnrichedOrderItem } from "@/entities/order";

export const OrdersPage = () => {
  const dispatch = useAppDispatch()
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [page, setPage] = useState(1);
  const limit = isMobile ? 8 : 10;

  const scrollResult = useGetOrdersScrollQuery(
    { page, limit },
    { skip: isMobile }
  );

  const paginationResult = useGetOrdersPaginationQuery(
    { page, limit },
    { skip: !isMobile }
  );

  const ordersResponse = isMobile ? paginationResult.data : scrollResult.data;
  const isLoading = isMobile ? paginationResult.isLoading : scrollResult.isLoading;
  const isFetching = isMobile ? paginationResult.isFetching : scrollResult.isFetching;

  const orders = ordersResponse?.items || [];
  const totalCount = ordersResponse?.totalCount || 0;

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const handleRateClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
    setIsReviewOpen(true);
  };

  useEffect(() => {
    if (!isMobile && orders?.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId, isMobile]);

  const loadMore = () => setPage((prev) => prev + 1);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    scrollToTop()
  };

  const activeOrder = orders?.find((o) => o.id === selectedOrderId) ?? orders?.[0];

  const {
    items,
    isLoading: isItemsLoading,
    isFetching: isItemsFetching,
  } = useEnrichedOrderItems(activeOrder?.orderItems ?? []);

  const orderCartProduct: CartProduct[] = items.map((item) => (
    { quantity: item.quantity, productId: item.product.id, sizeId: item.sizeId }
  ))

  // ── States ──────────────────────────────────────────────────────────────────



  if (!isLoading && orders.length === 0) {
    return (
      <OrderEmpty />
    );
  }

  const formatOrderDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const goodsTotal = activeOrder ? (
    Number(activeOrder.totalAmount) -
    Number(activeOrder.deliveryCost) -
    Number(activeOrder.paymentFee)
  ) : 0;

  const onOpenChange = () => {
    setIsOpen(prev => !prev)
  }

  const onCardClick = (id: string) => {
    onOpenChange()
    setSelectedOrderId(id)
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <main className={`${style.pageWrapper} container`}>
      <div className={style.header__wrapper}>
        <Breadcrumbs items={[{ label: 'Home', path: '/' }, { label: 'Orders' }]} />
        <h1 className={style.pageTitle}>My Orders</h1>
      </div>

      <div className={style.layoutGrid}>

        {/* ── Left: orders list ────────────────────────────────────────────── */}

        <OrdersList
          orders={orders}
          totalItems={totalCount}
          selectedOrderId={selectedOrderId || ''}
          currentPage={page}
          itemsPerPage={limit}
          formatOrderDate={formatOrderDate}
          onCardClick={onCardClick}
          onPageChange={handlePageChange}
          onLoadMore={loadMore}
          hasMore={orders.length < totalCount}
          isMobile={isMobile}
          isLoading={isLoading}
          isFetching={isFetching}
        />

        {/* ── Right: order details ─────────────────────────────────────────── */}

        {!isMobile && (isLoading || isItemsLoading) ? (
          <OrderDetailsSkeleton />
        ) : (
          activeOrder && (
            <OrderDetails
              open={isOpen}
              onOpenChange={onOpenChange}
              order={activeOrder}
              isFetching={isFetching}
              items={items}
              isItemsFetching={isItemsFetching}
              isItemsLoading={isItemsLoading}
              goodsTotal={goodsTotal}
              formatOrderDate={formatOrderDate}
              orderCartProduct={orderCartProduct}
              onRateClick={handleRateClick} />
          )
        )}

      </div>

      {activeOrder && (
        <ReviewTargetPicker
          isOpen={isReviewOpen}
          onOpenChange={setIsReviewOpen}
          orderItems={items}
          isLoading={isItemsLoading}
          onClose={() => setIsReviewOpen(false)}
          onAction={(item: EnrichedOrderItem) => {
            setIsReviewOpen(false);
            dispatch(openReviewModal(item.product.id.toString()));
          }}
        />
      )}
    </main>
  );
};