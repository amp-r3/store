import { useState, useEffect } from 'react';
import { useGetOrdersQuery } from '@/services/checkoutApi';
import style from './orders-page.module.scss';
import { useEnrichedOrderItems } from '@/hooks';
import { BackButton, Loader } from '@/components/common';
import { useNavigate } from 'react-router';
import { OrderCard } from './components/OrderCard/OrderCard';
import { OrderDetails } from './components/OrderDetails/OrderDetails';
import { OrderEmpty } from './components/OrderEmpty/OrderEmpty';

export const OrdersPage = () => {
  const navigate = useNavigate()
  const { data: orders, isLoading, isFetching } = useGetOrdersQuery();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <main className={`container ${style.pageWrapper}`}>
      <div className={style.header__wrapper}>
        <BackButton onClick={() => navigate(-1)} />
        <h1 className={style.pageTitle}>My Orders</h1>
      </div>

      <div className={style.layoutGrid}>

        {/* ── Left: orders list ────────────────────────────────────────────── */}
        <aside className={style.ordersList} role="listbox" aria-label="Orders">
          {orders.map((order) => {
            const isActive = order.id === selectedOrderId;

            return (
              <OrderCard
                order={order}
                isActive={isActive}
                formatOrderDate={formatOrderDate}
                setSelectedOrderId={setSelectedOrderId}
                key={order.id} />
            );
          })}
        </aside>

        {/* ── Right: order details ─────────────────────────────────────────── */}
        <OrderDetails
          order={activeOrder}
          isFetching={isFetching}
          items={items}
          isItemsFetching={isItemsFetching}
          isItemsLoading={isItemsLoading}
          goodsTotal={goodsTotal} />
      </div>
    </main>
  );
};