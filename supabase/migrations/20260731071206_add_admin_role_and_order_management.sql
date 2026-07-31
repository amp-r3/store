-- Admin panel stage 1: a role column on profiles, an is_admin() helper for
-- RLS, read access to every customer's orders/order_items/profiles, and the
-- only two admin write paths (order status, dashboard stats), both as
-- SECURITY DEFINER RPCs rather than UPDATE policies -- see the comments below
-- for why a plain UPDATE policy on orders would reopen the forged-purchase
-- hole closed in 20260723071805_harden_order_write_paths.sql.

-- Role lives on public.profiles rather than a JWT custom claim: no Auth Hook
-- to maintain in the Supabase dashboard (config.toml has no [auth] section
-- and `supabase config push` is never run against this project -- see
-- AGENTS.md), and RLS can read it directly through is_admin() below.
create type "public"."user_role" as enum ('user', 'admin');

alter table "public"."profiles"
    add column "role" "public"."user_role" not null default 'user';

-- profiles carries `grant all ... to anon, authenticated` and its UPDATE
-- policy has no WITH CHECK, so USING doubles as the check: every user may
-- update every column of their own row. With a `role` column that becomes a
-- one-line privilege escalation from the browser console. RLS cannot
-- restrict columns; column-level privileges can, and PostgREST honours them.
-- SECURITY DEFINER functions run as the table owner and are unaffected by
-- this revoke.
--
-- NOTE for future changes: a later `grant all on table public.profiles to
-- authenticated` would silently re-open this. Same failure mode documented
-- in 20260723075823_revoke_public_profiles_writes.sql for public_profiles.
revoke update on table "public"."profiles" from "anon", "authenticated";
grant update ("username", "first_name", "last_name", "avatar_url", "updated_at")
    on table "public"."profiles" to "anon", "authenticated";

-- SECURITY DEFINER so a policy on profiles calling this doesn't recurse
-- through the very policy it's evaluating. STABLE so callers can wrap it as
-- `(select public.is_admin())` and Postgres evaluates it once per statement
-- as an InitPlan instead of once per row -- same reasoning as the
-- `(select auth.uid())` rewrite in 20260726093753_optimize_rls_and_add_orders_index.sql.
create or replace function "public"."is_admin"()
returns boolean
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
    select exists (
        select 1
        from public.profiles p
        where p.id = (select auth.uid())
          and p.role = 'admin'::public.user_role
    );
$$;

alter function "public"."is_admin"() owner to "postgres";
revoke all on function "public"."is_admin"() from public;
grant execute on function "public"."is_admin"() to "authenticated", "service_role";
-- ALTER DEFAULT PRIVILEGES FOR ROLE postgres (set up in the init migration)
-- auto-grants EXECUTE on every new function to anon too; revoke it
-- explicitly since every caller of is_admin() below is `to authenticated`
-- and anon has no use for it.
revoke execute on function "public"."is_admin"() from "anon";

-- Postgres ORs permissive policies for the same command, so these are purely
-- additive: the existing owner-scoped SELECT policies keep serving the
-- customer read path untouched (no regression risk there) and admins get
-- everything on top. Rewriting the owner policies to
-- `using (uid = user_id or is_admin())` would produce an identical truth
-- table while touching the app's hottest queries for no benefit.
create policy "Admins can view all orders" on "public"."orders"
    for select to "authenticated"
    using ((select public.is_admin()));

create policy "Admins can view all order items" on "public"."order_items"
    for select to "authenticated"
    using ((select public.is_admin()));

-- Needed for the dashboard's customer counter. profiles is 1:1 with
-- auth.users via handle_new_user(), so count(profiles) is the user count.
create policy "Admins can view all profiles" on "public"."profiles"
    for select to "authenticated"
    using ((select public.is_admin()));

-- orders/order_items keep zero write policies (see 20260723071805) -- this
-- is the second write path alongside create_order, both SECURITY DEFINER.
--
-- Why not `for update to authenticated using (is_admin())` on orders:
--   1. No column granularity: `grant all on orders to authenticated` is
--      already in place, so RLS is the only gate. Such a policy would also
--      hand an admin total_amount, user_id, shipping_address, order_number.
--   2. `status` would desync: sync_order_main_status() is a
--      `before update of payment_status, delivery_status` trigger. A bare
--      `update orders set status = 'completed'` does not fire it, and
--      status='completed' is exactly what add_or_update_review() treats as
--      proof of purchase -- a column-blind UPDATE policy would reopen the
--      forged-verified-purchase hole closed in 20260723071805.
--
-- Both parameters are always in the SET list below, so the trigger always
-- fires and `status` is always re-derived server-side; the admin never
-- writes `status` directly. Returns void: the composite row wouldn't carry
-- the delivery_methods/payment_methods/order_items embeds the client's
-- mapOrderResponseToOrder needs, so there's nothing useful to return --
-- the client relies on invalidatesTags: ['Order'] instead.
create or replace function "public"."admin_update_order_status"(
    "p_order_id" uuid,
    "p_payment_status" "public"."payment_status" default null,
    "p_delivery_status" "public"."delivery_status" default null
)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
    if auth.uid() is null then
        raise exception 'Not authenticated';
    end if;

    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    if p_payment_status is null and p_delivery_status is null then
        raise exception 'Nothing to update';
    end if;

    update public.orders
    set
        payment_status = coalesce(p_payment_status, orders.payment_status),
        delivery_status = coalesce(p_delivery_status, orders.delivery_status)
    where orders.id = p_order_id;

    if not found then
        raise exception 'Order not found';
    end if;
end;
$$;

alter function "public"."admin_update_order_status"(uuid, "public"."payment_status", "public"."delivery_status")
    owner to "postgres";
revoke all on function "public"."admin_update_order_status"(uuid, "public"."payment_status", "public"."delivery_status")
    from public;
grant execute on function "public"."admin_update_order_status"(uuid, "public"."payment_status", "public"."delivery_status")
    to "authenticated", "service_role";
revoke execute on function "public"."admin_update_order_status"(uuid, "public"."payment_status", "public"."delivery_status")
    from "anon";

-- One round-trip, admin-gated, jsonb return so the client casts once at the
-- boundary the same way it already does for create_order's response.
create or replace function "public"."admin_dashboard_stats"()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_stats jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select jsonb_build_object(
        'orders_total', (select count(*) from public.orders),
        'orders_active', (select count(*) from public.orders
            where status not in ('completed', 'cancelled')),
        'orders_awaiting_payment', (select count(*) from public.orders
            where payment_status = 'awaiting_payment' and status <> 'cancelled'),
        'orders_awaiting_dispatch', (select count(*) from public.orders
            where delivery_status = 'awaiting_dispatch' and status <> 'cancelled'),
        'revenue_total', (select coalesce(sum(total_amount), 0) from public.orders
            where payment_status = 'paid'),
        'customers_total', (select count(*) from public.profiles),
        'products_total', (select count(*) from public.products)
    ) into v_stats;

    return v_stats;
end;
$$;

alter function "public"."admin_dashboard_stats"() owner to "postgres";
revoke all on function "public"."admin_dashboard_stats"() from public;
grant execute on function "public"."admin_dashboard_stats"() to "authenticated", "service_role";
revoke execute on function "public"."admin_dashboard_stats"() from "anon";
