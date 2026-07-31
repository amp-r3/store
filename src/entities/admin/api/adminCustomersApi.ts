import { supabase, baseApi } from '@/shared/api';
import type { Database } from '@/shared/api';

type UserRole = Database['public']['Enums']['user_role'];

// admin_customers_view is a Postgres view: PG cannot express NOT NULL for
// view columns, so every generated column comes back `| null` even though
// the underlying columns (profiles.id/username, auth.users.email, ...) are
// not null. One documented cast at the query boundary, same pattern as
// products_view in entities/product/api/productsApi.ts.
type AdminCustomerRow = Database['public']['Views']['admin_customers_view']['Row'];

export interface AdminCustomer {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  email: string;
  registeredAt: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

export interface AdminCustomersQueryArgs {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedAdminCustomers {
  items: AdminCustomer[];
  totalCount: number;
}

export const adminCustomersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // admin_customers_view is gated by `where is_admin()` in the view itself
    // (not RLS — it runs security_invoker = off to reach auth.users.email),
    // so a non-admin calling this gets zero rows rather than an error; the
    // real gate is AdminRoute plus the view definition.
    getAdminCustomers: builder.query<PaginatedAdminCustomers, AdminCustomersQueryArgs>({
      queryFn: async ({ page, limit, search }) => {
        const from = (page - 1) * limit;
        const to = page * limit - 1;

        let query = supabase
          .from('admin_customers_view')
          .select('*', { count: 'exact' });

        const trimmedSearch = search?.trim();
        if (trimmedSearch) {
          query = query.ilike('username', `%${trimmedSearch}%`);
        }

        const { data, error, count } = await query
          .order('registered_at', { ascending: false })
          .range(from, to);

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const items: AdminCustomer[] = ((data ?? []) as unknown as AdminCustomerRow[]).map((row) => ({
          // id/username/role/email/registeredAt back onto NOT NULL columns
          // (profiles.id/username/role, auth.users.email/created_at) — the
          // view-column nullability is a Postgres artifact, not a real gap.
          id: row.id as string,
          username: row.username as string,
          firstName: row.first_name,
          lastName: row.last_name,
          avatarUrl: row.avatar_url,
          role: row.role as UserRole,
          email: row.email as string,
          registeredAt: row.registered_at as string,
          ordersCount: Number(row.orders_count),
          totalSpent: Number(row.total_spent),
          lastOrderAt: row.last_order_at,
        }));

        return { data: { items, totalCount: count ?? 0 } };
      },
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => ({ type: 'Customer' as const, id: item.id })), { type: 'Customer', id: 'LIST' }]
          : [{ type: 'Customer', id: 'LIST' }],
    }),

    setAdminUserRole: builder.mutation<null, { userId: string; role: UserRole }>({
      queryFn: async ({ userId, role }) => {
        const { error } = await supabase.rpc('admin_set_user_role', { p_user_id: userId, p_role: role });

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        return { data: null };
      },
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'Customer', id: userId }, { type: 'Customer', id: 'LIST' }],
    }),
  }),
});

export const { useGetAdminCustomersQuery, useSetAdminUserRoleMutation } = adminCustomersApi;
