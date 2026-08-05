-- Admin Finance page analytics: where the money from each paid order went
-- (items subtotal, delivery, payment fees), what discounts and free
-- shipping cost the store, and how much was refunded/cancelled.
--
-- All three mirror the guard/shape conventions of the existing
-- admin_revenue_series/admin_top_products RPCs: STABLE SECURITY DEFINER,
-- search_path locked, is_admin() gate, jsonb_build_object / jsonb_agg
-- return shape re-declared by hand on the TS side (jsonb RPCs generate as
-- the shapeless Json type).
--
-- Known approximation: shipping_subsidy compares orders.delivery_cost
-- (snapshotted at order time) against delivery_methods.price (current). If
-- a delivery method's price changed since an order, the subsidy for that
-- order is computed against today's price rather than the price at order
-- time — there is no delivery-price snapshot column, unlike order_items'
-- base_price_at_purchase.

CREATE OR REPLACE FUNCTION "public"."admin_finance_summary"("p_days" integer DEFAULT 30) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_result jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    with orders_window as (
        select o.*
        from public.orders o
        where o.created_at::date between (current_date - (greatest(p_days, 1) - 1)) and current_date
    ),
    items_agg as (
        select
            oi.order_id,
            sum(oi.price_at_purchase * oi.quantity) as items_subtotal,
            sum((oi.base_price_at_purchase - oi.price_at_purchase) * oi.quantity) as discount_amount
        from public.order_items oi
        join orders_window ow on ow.id = oi.order_id
        group by oi.order_id
    ),
    paid_count as (
        select count(*) as n from orders_window where payment_status = 'paid'
    )
    select jsonb_build_object(
        'gross_collected', coalesce(sum(ow.total_amount) filter (where ow.payment_status = 'paid'), 0),
        'items_subtotal', coalesce(sum(ia.items_subtotal) filter (where ow.payment_status = 'paid'), 0),
        'delivery_collected', coalesce(sum(ow.delivery_cost) filter (where ow.payment_status = 'paid'), 0),
        'payment_fees', coalesce(sum(ow.payment_fee) filter (where ow.payment_status = 'paid'), 0),
        'discounts_given', coalesce(sum(ia.discount_amount) filter (where ow.payment_status = 'paid'), 0),
        'shipping_subsidy', coalesce(sum(greatest(dm.price - ow.delivery_cost, 0)) filter (where ow.payment_status = 'paid'), 0),
        'refunded_amount', coalesce(sum(ow.total_amount) filter (where ow.payment_status = 'refunded'), 0),
        'cancelled_amount', coalesce(sum(ow.total_amount) filter (where ow.status in ('cancelled', 'returned')), 0),
        'paid_orders', (select n from paid_count),
        'avg_order_value', case when (select n from paid_count) = 0 then 0
            else round(coalesce(sum(ow.total_amount) filter (where ow.payment_status = 'paid'), 0) / (select n from paid_count), 2)
        end
    ) into v_result
    from orders_window ow
    left join items_agg ia on ia.order_id = ow.id
    left join public.delivery_methods dm on dm.id = ow.delivery_method_id;

    return v_result;
end;
$$;

ALTER FUNCTION "public"."admin_finance_summary"("p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_finance_series"("p_days" integer DEFAULT 30) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_result jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    with days as (
        select gs.day::date as day
        from generate_series(current_date - (greatest(p_days, 1) - 1), current_date, interval '1 day') as gs(day)
    ),
    orders_paid as (
        select o.id, o.created_at::date as day, o.delivery_cost, o.payment_fee
        from public.orders o
        where o.payment_status = 'paid'
    ),
    items_agg as (
        select oi.order_id, sum(oi.price_at_purchase * oi.quantity) as items_subtotal
        from public.order_items oi
        group by oi.order_id
    ),
    refunded_by_day as (
        select o.created_at::date as day, sum(o.total_amount) as refunded
        from public.orders o
        where o.payment_status = 'refunded'
        group by o.created_at::date
    )
    select coalesce(jsonb_agg(t order by t.day), '[]'::jsonb) into v_result
    from (
        select
            d.day,
            coalesce(sum(ia.items_subtotal), 0) as items_subtotal,
            coalesce(sum(op.delivery_cost), 0) as delivery_cost,
            coalesce(sum(op.payment_fee), 0) as payment_fee,
            coalesce(rbd.refunded, 0) as refunded,
            count(op.id) as orders_count
        from days d
        left join orders_paid op on op.day = d.day
        left join items_agg ia on ia.order_id = op.id
        left join refunded_by_day rbd on rbd.day = d.day
        group by d.day, rbd.refunded
    ) t;

    return v_result;
end;
$$;

ALTER FUNCTION "public"."admin_finance_series"("p_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_finance_breakdown"("p_days" integer DEFAULT 30) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_result jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    with orders_window as (
        select o.*
        from public.orders o
        where o.payment_status = 'paid'
          and o.created_at::date between (current_date - (greatest(p_days, 1) - 1)) and current_date
    ),
    pm_agg as (
        select
            pm.code,
            pm.name,
            pm.fee_percentage,
            pm.fee_fixed,
            count(ow.id) as orders_count,
            coalesce(sum(ow.total_amount), 0) as gross,
            coalesce(sum(ow.payment_fee), 0) as fees
        from public.payment_methods pm
        left join orders_window ow on ow.payment_method_id = pm.id
        group by pm.id, pm.code, pm.name, pm.fee_percentage, pm.fee_fixed
        having count(ow.id) > 0
    ),
    dm_agg as (
        select
            dm.code,
            dm.name,
            count(ow.id) as orders_count,
            coalesce(sum(ow.delivery_cost), 0) as collected,
            count(ow.id) filter (where ow.delivery_cost = 0 and dm.price > 0) as free_count,
            coalesce(sum(greatest(dm.price - ow.delivery_cost, 0)), 0) as subsidy
        from public.delivery_methods dm
        left join orders_window ow on ow.delivery_method_id = dm.id
        group by dm.id, dm.code, dm.name, dm.price
        having count(ow.id) > 0
    )
    select jsonb_build_object(
        'payment_methods', coalesce((select jsonb_agg(pma order by pma.gross desc) from pm_agg pma), '[]'::jsonb),
        'delivery_methods', coalesce((select jsonb_agg(dma order by dma.collected desc) from dm_agg dma), '[]'::jsonb)
    ) into v_result;

    return v_result;
end;
$$;

ALTER FUNCTION "public"."admin_finance_breakdown"("p_days" integer) OWNER TO "postgres";
