import { Order } from '@/entities/order';

import { AdminOrderRow } from '../AdminOrderRow/AdminOrderRow';
import { AdminOrderRowSkeleton } from '../AdminOrderRow/AdminOrderRowSkeleton';
import style from './admin-orders-table.module.scss';

interface AdminOrdersTableProps {
    orders: Order[];
    isLoading: boolean;
    limit: number;
    formatOrderDate: (date: string) => string;
}

export const AdminOrdersTable = ({ orders, isLoading, limit, formatOrderDate }: AdminOrdersTableProps) => (
    <div className={style['admin-orders-table']} role="list">
        <div className={style['admin-orders-table__header']} role="presentation" aria-hidden="true">
            <span>Order</span>
            <span>Customer</span>
            <span>Items</span>
            <span>Total</span>
            <span>Status</span>
            <span>Payment</span>
            <span>Delivery</span>
        </div>

        {isLoading ? (
            <AdminOrderRowSkeleton count={limit} />
        ) : (
            orders.map((order) => (
                <AdminOrderRow key={order.id} order={order} formatOrderDate={formatOrderDate} />
            ))
        )}
    </div>
);
