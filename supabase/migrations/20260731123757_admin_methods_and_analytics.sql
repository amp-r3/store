-- Admin panel stage 5: editing delivery/payment methods, and dashboard
-- analytics beyond the single-snapshot admin_dashboard_stats().
--
-- Methods get update-only RPCs, not create/delete: `code` is drawn from a
-- fixed enum (delivery_method_type / payment_method_type) and
-- orders.delivery_method_id / payment_method_id are `on delete restrict`, so
-- the set of methods is meant to stay fixed -- only price/fee/copy/is_active
-- are ever meant to change.
create or replace function "public"."admin_update_delivery_method"("p_id" "uuid", "p_payload" jsonb)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_before jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select to_jsonb(m) into v_before from public.delivery_methods m where m.id = p_id;
    if v_before is null then
        raise exception 'Delivery method not found';
    end if;

    update public.delivery_methods set
        name = coalesce(p_payload->>'name', name),
        price = coalesce((p_payload->>'price')::numeric, price),
        estimated_time = coalesce(p_payload->>'estimated_time', estimated_time),
        is_active = coalesce((p_payload->>'is_active')::boolean, is_active),
        free_from_price = case when p_payload ? 'free_from_price'
            then nullif(p_payload->>'free_from_price', '')::numeric else free_from_price end
    where id = p_id;

    perform public.log_admin_action('delivery_method.update', 'delivery_method', p_id::text, v_before, p_payload);
end;
$$;

alter function "public"."admin_update_delivery_method"("uuid", jsonb) owner to "postgres";
revoke all on function "public"."admin_update_delivery_method"("uuid", jsonb) from public;
grant execute on function "public"."admin_update_delivery_method"("uuid", jsonb) to "authenticated", "service_role";
revoke execute on function "public"."admin_update_delivery_method"("uuid", jsonb) from "anon";

create or replace function "public"."admin_update_payment_method"("p_id" "uuid", "p_payload" jsonb)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_before jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select to_jsonb(m) into v_before from public.payment_methods m where m.id = p_id;
    if v_before is null then
        raise exception 'Payment method not found';
    end if;

    update public.payment_methods set
        name = coalesce(p_payload->>'name', name),
        fee_percentage = coalesce((p_payload->>'fee_percentage')::numeric, fee_percentage),
        fee_fixed = coalesce((p_payload->>'fee_fixed')::numeric, fee_fixed),
        is_active = coalesce((p_payload->>'is_active')::boolean, is_active)
    where id = p_id;

    perform public.log_admin_action('payment_method.update', 'payment_method', p_id::text, v_before, p_payload);
end;
$$;

alter function "public"."admin_update_payment_method"("uuid", jsonb) owner to "postgres";
revoke all on function "public"."admin_update_payment_method"("uuid", jsonb) from public;
grant execute on function "public"."admin_update_payment_method"("uuid", jsonb) to "authenticated", "service_role";
revoke execute on function "public"."admin_update_payment_method"("uuid", jsonb) from "anon";

-- ── Analytics. Each panel loads independently rather than one wide RPC, so
--    a slow chart doesn't block the rest of the dashboard from rendering.
create or replace function "public"."admin_revenue_series"("p_days" integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_result jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select coalesce(jsonb_agg(t order by t.day), '[]'::jsonb) into v_result
    from (
        select
            gs.day::date as day,
            coalesce(sum(o.total_amount) filter (where o.payment_status = 'paid'), 0) as revenue,
            count(o.id) as orders_count
        from generate_series(current_date - (greatest(p_days, 1) - 1), current_date, interval '1 day') as gs(day)
        left join public.orders o on o.created_at::date = gs.day
        group by gs.day
    ) t;

    return v_result;
end;
$$;

alter function "public"."admin_revenue_series"(integer) owner to "postgres";
revoke all on function "public"."admin_revenue_series"(integer) from public;
grant execute on function "public"."admin_revenue_series"(integer) to "authenticated", "service_role";
revoke execute on function "public"."admin_revenue_series"(integer) from "anon";

-- Excludes cancelled/returned/refunded orders: those are reversed sales, not
-- demand signal. Pending/processing/shipped/completed all count -- an order
-- still in flight is still a real sale until something reverses it.
create or replace function "public"."admin_top_products"("p_limit" integer default 10)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_result jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select coalesce(jsonb_agg(t), '[]'::jsonb) into v_result
    from (
        select
            p.id as product_id,
            p.title,
            p.thumbnail,
            sum(oi.quantity) as units_sold,
            sum(oi.quantity * oi.price_at_purchase) as revenue
        from public.order_items oi
        join public.orders o on o.id = oi.order_id
        join public.products p on p.id = oi.product_id
        where o.status not in ('cancelled', 'returned', 'refunded')
        group by p.id, p.title, p.thumbnail
        order by units_sold desc
        limit greatest(p_limit, 1)
    ) t;

    return v_result;
end;
$$;

alter function "public"."admin_top_products"(integer) owner to "postgres";
revoke all on function "public"."admin_top_products"(integer) from public;
grant execute on function "public"."admin_top_products"(integer) to "authenticated", "service_role";
revoke execute on function "public"."admin_top_products"(integer) from "anon";

create or replace function "public"."admin_low_stock"("p_threshold" integer default 5, "p_limit" integer default 20)
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_result jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select coalesce(jsonb_agg(t), '[]'::jsonb) into v_result
    from (
        select
            ps.id as size_id,
            ps.value,
            ps.stock,
            p.id as product_id,
            p.title,
            p.thumbnail
        from public.product_sizes ps
        join public.products p on p.id = ps.product_id
        where ps.stock <= p_threshold and not p.is_archived
        order by ps.stock asc
        limit greatest(p_limit, 1)
    ) t;

    return v_result;
end;
$$;

alter function "public"."admin_low_stock"(integer, integer) owner to "postgres";
revoke all on function "public"."admin_low_stock"(integer, integer) from public;
grant execute on function "public"."admin_low_stock"(integer, integer) to "authenticated", "service_role";
revoke execute on function "public"."admin_low_stock"(integer, integer) from "anon";

create or replace function "public"."admin_orders_by_status"()
returns jsonb
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_result jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select coalesce(jsonb_object_agg(s.status, coalesce(c.count, 0)), '{}'::jsonb) into v_result
    from unnest(enum_range(null::public.order_status)) as s(status)
    left join (
        select status, count(*) as count from public.orders group by status
    ) c on c.status = s.status;

    return v_result;
end;
$$;

alter function "public"."admin_orders_by_status"() owner to "postgres";
revoke all on function "public"."admin_orders_by_status"() from public;
grant execute on function "public"."admin_orders_by_status"() to "authenticated", "service_role";
revoke execute on function "public"."admin_orders_by_status"() from "anon";
