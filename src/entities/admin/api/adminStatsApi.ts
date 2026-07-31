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

export interface AdminRevenueSeriesPoint {
  day: string;
  revenue: number;
  ordersCount: number;
}

export interface AdminTopProduct {
  productId: number;
  title: string;
  thumbnail: string | null;
  unitsSold: number;
  revenue: number;
}

export interface AdminLowStockItem {
  sizeId: number;
  productId: number;
  title: string;
  thumbnail: string | null;
  value: string;
  stock: number;
}

export type AdminOrdersByStatus = Record<string, number>;

export const adminStatsApi = baseApi.injectEndpoints({
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

    // Each analytics panel is its own query so a slow chart doesn't block the
    // rest of the dashboard — mirrors the RPC split in the migration.
    getAdminRevenueSeries: builder.query<AdminRevenueSeriesPoint[], number | void>({
      queryFn: async (days) => {
        const { data, error } = await supabase.rpc('admin_revenue_series', days ? { p_days: days } : undefined);

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const rows = data as unknown as { day: string; revenue: number; orders_count: number }[];
        return { data: rows.map((row) => ({ day: row.day, revenue: Number(row.revenue), ordersCount: row.orders_count })) };
      },
      providesTags: ['AdminStats'],
    }),

    getAdminTopProducts: builder.query<AdminTopProduct[], number | void>({
      queryFn: async (limit) => {
        const { data, error } = await supabase.rpc('admin_top_products', limit ? { p_limit: limit } : undefined);

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const rows = data as unknown as { product_id: number; title: string; thumbnail: string | null; units_sold: number; revenue: number }[];
        return {
          data: rows.map((row) => ({
            productId: row.product_id,
            title: row.title,
            thumbnail: row.thumbnail,
            unitsSold: Number(row.units_sold),
            revenue: Number(row.revenue),
          })),
        };
      },
      providesTags: ['AdminStats'],
    }),

    getAdminLowStock: builder.query<AdminLowStockItem[], { threshold?: number; limit?: number } | void>({
      queryFn: async (args) => {
        const { data, error } = await supabase.rpc('admin_low_stock', {
          ...(args?.threshold !== undefined && { p_threshold: args.threshold }),
          ...(args?.limit !== undefined && { p_limit: args.limit }),
        });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const rows = data as unknown as { size_id: number; product_id: number; title: string; thumbnail: string | null; value: string; stock: number }[];
        return {
          data: rows.map((row) => ({
            sizeId: row.size_id,
            productId: row.product_id,
            title: row.title,
            thumbnail: row.thumbnail,
            value: row.value,
            stock: row.stock,
          })),
        };
      },
      providesTags: ['Size'],
    }),

    getAdminOrdersByStatus: builder.query<AdminOrdersByStatus, void>({
      queryFn: async () => {
        const { data, error } = await supabase.rpc('admin_orders_by_status');

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: data as unknown as AdminOrdersByStatus };
      },
      providesTags: ['Order'],
    }),
  }),
});

export const {
  useGetAdminDashboardStatsQuery,
  useGetAdminRevenueSeriesQuery,
  useGetAdminTopProductsQuery,
  useGetAdminLowStockQuery,
  useGetAdminOrdersByStatusQuery,
} = adminStatsApi;
