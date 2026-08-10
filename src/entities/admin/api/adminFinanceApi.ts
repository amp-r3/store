import { supabase, baseApi } from '@/shared/api';

// admin_finance_summary's jsonb_build_object keys, as returned by the RPC.
interface AdminFinanceSummaryRow {
  gross_collected: number;
  items_subtotal: number;
  delivery_collected: number;
  payment_fees: number;
  discounts_given: number;
  shipping_subsidy: number;
  refunded_amount: number;
  cancelled_amount: number;
  paid_orders: number;
  avg_order_value: number;
}

export interface AdminFinanceSummary {
  grossCollected: number;
  itemsSubtotal: number;
  deliveryCollected: number;
  paymentFees: number;
  discountsGiven: number;
  shippingSubsidy: number;
  refundedAmount: number;
  cancelledAmount: number;
  paidOrders: number;
  avgOrderValue: number;
}

export interface AdminFinanceSeriesPoint {
  day: string;
  itemsSubtotal: number;
  deliveryCost: number;
  paymentFee: number;
  refunded: number;
  ordersCount: number;
}

export interface AdminFinancePaymentMethodBreakdown {
  code: string;
  name: string;
  feePercentage: number;
  feeFixed: number;
  ordersCount: number;
  gross: number;
  fees: number;
}

export interface AdminFinanceDeliveryMethodBreakdown {
  code: string;
  name: string;
  ordersCount: number;
  collected: number;
  freeCount: number;
  subsidy: number;
}

export interface AdminFinanceBreakdown {
  paymentMethods: AdminFinancePaymentMethodBreakdown[];
  deliveryMethods: AdminFinanceDeliveryMethodBreakdown[];
}

export const adminFinanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Each panel is its own query so a slow chart doesn't block the rest of
    // the page — mirrors the RPC split used by the dashboard's adminStatsApi.
    getAdminFinanceSummary: builder.query<AdminFinanceSummary, number | void>({
      queryFn: async (days) => {
        const { data, error } = await supabase.rpc(
          'admin_finance_summary',
          days ? { p_days: days } : undefined,
        );

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        // admin_finance_summary returns jsonb; jsonb RPC returns generate as
        // the shapeless `Json` type with no shape guarantee from the DB. One
        // documented cast at the boundary, same pattern as
        // adminStatsApi.getAdminDashboardStats.
        const row = data as unknown as AdminFinanceSummaryRow;

        return {
          data: {
            grossCollected: Number(row.gross_collected),
            itemsSubtotal: Number(row.items_subtotal),
            deliveryCollected: Number(row.delivery_collected),
            paymentFees: Number(row.payment_fees),
            discountsGiven: Number(row.discounts_given),
            shippingSubsidy: Number(row.shipping_subsidy),
            refundedAmount: Number(row.refunded_amount),
            cancelledAmount: Number(row.cancelled_amount),
            paidOrders: row.paid_orders,
            avgOrderValue: Number(row.avg_order_value),
          },
        };
      },
      providesTags: ['AdminStats'],
    }),

    getAdminFinanceSeries: builder.query<AdminFinanceSeriesPoint[], number | void>({
      queryFn: async (days) => {
        const { data, error } = await supabase.rpc(
          'admin_finance_series',
          days ? { p_days: days } : undefined,
        );

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const rows = data as unknown as {
          day: string;
          items_subtotal: number;
          delivery_cost: number;
          payment_fee: number;
          refunded: number;
          orders_count: number;
        }[];

        return {
          data: rows.map((row) => ({
            day: row.day,
            itemsSubtotal: Number(row.items_subtotal),
            deliveryCost: Number(row.delivery_cost),
            paymentFee: Number(row.payment_fee),
            refunded: Number(row.refunded),
            ordersCount: row.orders_count,
          })),
        };
      },
      providesTags: ['AdminStats'],
    }),

    getAdminFinanceBreakdown: builder.query<AdminFinanceBreakdown, number | void>({
      queryFn: async (days) => {
        const { data, error } = await supabase.rpc(
          'admin_finance_breakdown',
          days ? { p_days: days } : undefined,
        );

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const row = data as unknown as {
          payment_methods: {
            code: string;
            name: string;
            fee_percentage: number;
            fee_fixed: number;
            orders_count: number;
            gross: number;
            fees: number;
          }[];
          delivery_methods: {
            code: string;
            name: string;
            orders_count: number;
            collected: number;
            free_count: number;
            subsidy: number;
          }[];
        };

        return {
          data: {
            paymentMethods: row.payment_methods.map((pm) => ({
              code: pm.code,
              name: pm.name,
              feePercentage: Number(pm.fee_percentage),
              feeFixed: Number(pm.fee_fixed),
              ordersCount: pm.orders_count,
              gross: Number(pm.gross),
              fees: Number(pm.fees),
            })),
            deliveryMethods: row.delivery_methods.map((dm) => ({
              code: dm.code,
              name: dm.name,
              ordersCount: dm.orders_count,
              collected: Number(dm.collected),
              freeCount: dm.free_count,
              subsidy: Number(dm.subsidy),
            })),
          },
        };
      },
      providesTags: ['AdminStats'],
    }),
  }),
});

export const {
  useGetAdminFinanceSummaryQuery,
  useGetAdminFinanceSeriesQuery,
  useGetAdminFinanceBreakdownQuery,
} = adminFinanceApi;
