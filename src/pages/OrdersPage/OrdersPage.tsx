import { useState, useEffect } from 'react';
import { useGetOrdersQuery } from '@/services/checkoutApi';
import style from './orders-page.module.scss';
import { useEnrichedOrderItems, useMediaQuery } from '@/hooks';
import { BackButton, Loader } from '@/components/common';
import { useNavigate } from 'react-router';
import { OrderEmpty } from './components/OrderEmpty/OrderEmpty';
import { OrderDetailsCard } from './components/OrderDetails/OrderDetailsCard/OrderDetailsCard';
import { OrderDetailsDrawer } from './components/OrderDetails/OrderDetailsDrawer/OrderDetailsDrawer';
import { OrdersList } from './components/OrdersList/OrderList';

export const OrdersPage = () => {
  const navigate = useNavigate()
  const { data: orders, isLoading, isFetching } = useGetOrdersQuery();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)')

  useEffect(() => {
    if (orders?.length && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  const activeOrder = orders?.find((o) => o.id === selectedOrderId) ?? orders?.[0];

  const {
    items,
    isLoading: isItemsLoading,
    isFetching: isItemsFetching,
  } = useEnrichedOrderItems(activeOrder?.orderItems ?? []);

  // ── States ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Loader />
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <OrderEmpty />
    );
  }

  if (!activeOrder) return null;

  const formatOrderDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const goodsTotal =
    Number(activeOrder.totalAmount) -
    Number(activeOrder.deliveryCost) -
    Number(activeOrder.paymentFee);

  const onOpenChange = () => {
    setIsOpen(prev => !prev)
  }

  const onCardClick = (id: string) => {
    if (isMobile) {
      onOpenChange()
    }
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
          formatOrderDate={formatOrderDate}
          onCardClick={onCardClick}
          selectedOrderId={selectedOrderId}
        />

        {/* ── Right: order details ─────────────────────────────────────────── */}

        {
          isMobile ? <OrderDetailsDrawer
            open={isOpen}
            order={activeOrder}
            isFetching={isFetching}
            items={items}
            isItemsFetching={isItemsFetching}
            isItemsLoading={isItemsLoading}
            goodsTotal={goodsTotal}
            onOpenChange={onOpenChange}
            formatOrderDate={formatOrderDate} /> :
            <OrderDetailsCard
              order={activeOrder}
              isFetching={isFetching}
              items={items}
              isItemsFetching={isItemsFetching}
              isItemsLoading={isItemsLoading}
              goodsTotal={goodsTotal}
              formatOrderDate={formatOrderDate} />
        }
      </div>
    </main>
  );
};