import { supabase, baseApi } from '@/shared/api';

export interface AdminAuditEntry {
  id: string;
  actorId: string | null;
  actorUsername: string;
  action: string;
  entityType: string;
  entityId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  createdAt: string;
}

export interface AdminAuditQueryArgs {
  page: number;
  limit: number;
  action?: string;
  entityType?: string;
  actorId?: string;
}

export interface PaginatedAdminAudit {
  items: AdminAuditEntry[];
  totalCount: number;
}

export const adminAuditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Read-only: every write to this table goes through log_admin_action,
    // called from inside the other admin RPCs — there's no admin mutation
    // here to invalidate this query's own tag.
    getAdminAuditLog: builder.query<PaginatedAdminAudit, AdminAuditQueryArgs>({
      queryFn: async ({ page, limit, action, entityType, actorId }) => {
        const from = (page - 1) * limit;
        const to = page * limit - 1;

        let query = supabase
          .from('admin_audit_log')
          .select('*', { count: 'exact' });

        if (action) query = query.eq('action', action);
        if (entityType) query = query.eq('entity_type', entityType);
        if (actorId) query = query.eq('actor_id', actorId);

        // The only index on this table is (created_at desc) — the sort
        // this query always uses.
        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) {
          return { error: { status: 400, data: error.message } };
        }

        const items: AdminAuditEntry[] = (data ?? []).map((row) => ({
          id: row.id,
          actorId: row.actor_id,
          actorUsername: row.actor_username || 'System',
          action: row.action,
          entityType: row.entity_type,
          entityId: row.entity_id,
          // before/after are jsonb with no schema-level shape guarantee —
          // each log_admin_action call site controls its own shape. One
          // documented cast at the query boundary, same pattern as
          // shipping_address in entities/order/api/orderApi.ts.
          before: row.before as unknown as Record<string, unknown> | null,
          after: row.after as unknown as Record<string, unknown> | null,
          createdAt: row.created_at,
        }));

        return { data: { items, totalCount: count ?? 0 } };
      },
      providesTags: (result) =>
        result
          ? [...result.items.map((item) => ({ type: 'AuditLog' as const, id: item.id })), { type: 'AuditLog', id: 'LIST' }]
          : [{ type: 'AuditLog', id: 'LIST' }],
    }),
  }),
});

export const { useGetAdminAuditLogQuery } = adminAuditApi;
