import { supabase, baseApi } from '@/shared/api';
import { AdminDashboardStats } from '../model/types';

// admin_dashboard_stats' jsonb_build_object keys, as returned by the RPC.
interface AdminDashboardStatsRow {
  orders_total: number;
  orders_active: number;
  orders_awaiting_payment: number;
  orders_awaiting_dispatch: number;
  revenue_total: number;
  customers_total: number;
  products_total: number;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminDashboardStats: builder.query<AdminDashboardStats, void>({
      queryFn: async () => {
        const { data, error } = await supabase.rpc('admin_dashboard_stats');

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        // admin_dashboard_stats returns jsonb; jsonb RPC returns generate as
        // the shapeless `Json` type with no shape guarantee from the DB. One
        // documented cast at the boundary, same pattern as create_order's
        // jsonb return in entities/order/api/orderApi.ts.
        const row = data as unknown as AdminDashboardStatsRow;

        return {
          data: {
            ordersTotal: row.orders_total,
            ordersActive: row.orders_active,
            ordersAwaitingPayment: row.orders_awaiting_payment,
            ordersAwaitingDispatch: row.orders_awaiting_dispatch,
            revenueTotal: Number(row.revenue_total),
            customersTotal: row.customers_total,
            productsTotal: row.products_total,
          },
        };
      },
      // No dedicated tag: this DTO spans orders/profiles/products and stage 1
      // has no mutation touching customers/products counts. 'Order' is
      // enough to keep it fresh after an admin order status change.
      providesTags: ['Order'],
    }),
  }),
});

export const { useGetAdminDashboardStatsQuery } = adminApi;
