import { useState, useEffect } from 'react';
import { useGetOrdersPaginationQuery, useGetOrdersScrollQuery } from '@/services/orderApi';
import style from './orders-page.module.scss';
import { useEnrichedOrderItems, useMediaQuery } from '@/hooks';
import { BackButton, Loader } from '@/components/common';
import { useNavigate } from 'react-router';
import { OrderEmpty } from './components/OrderEmpty/OrderEmpty';
import { OrderDetailsSkeleton } from './components/OrderDetails/OrderDetailsSkeleton';
import { OrdersList } from './components/OrdersList/OrderList';
import { OrderDetails } from './components/OrderDetails/OrderDetails';
import { scrollToTop } from '@/utils';
import { CartProduct } from '@/store/selectors/cartSelectors';

export const OrdersPage = () => {
  const navigate = useNavigate()
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
        <BackButton onClick={() => navigate(-1)} />
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
              orderCartProduct={orderCartProduct} />
          )
        )}

      </div>
    </main>
  );
};