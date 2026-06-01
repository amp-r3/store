import { useState, useEffect } from 'react';
import { useGetOrdersQuery } from '@/services/checkoutApi';
import style from './orders-page.module.scss';
import { useEnrichedOrderItems } from '@/hooks';
import { BackButton, Loader } from '@/components/common';
import { useNavigate } from 'react-router';
import { OrderEmpty } from './components/OrderEmpty/OrderEmpty';
import { OrdersList } from './components/OrdersList/OrderList';
import { OrderDetails } from './components/OrderDetails/OrderDetails';

export const OrdersPage = () => {
  const navigate = useNavigate()
  const { data: orders, isLoading, isFetching } = useGetOrdersQuery();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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
          formatOrderDate={formatOrderDate}
          onCardClick={onCardClick}
          selectedOrderId={selectedOrderId}
        />

        {/* ── Right: order details ─────────────────────────────────────────── */}

        <OrderDetails
          open={isOpen}
          onOpenChange={onOpenChange}
          order={activeOrder}
          isFetching={isFetching}
          items={items}
          isItemsFetching={isItemsFetching}
          isItemsLoading={isItemsLoading}
          goodsTotal={goodsTotal}
          formatOrderDate={formatOrderDate} />

      </div>
    </main>
  );
};