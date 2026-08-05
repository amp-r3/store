-- admin_revenue_series filtered revenue to paid orders but counted every
-- order regardless of payment_status, so the panel's "N orders in this
-- period" and each day's tooltip paired paid revenue with a larger,
-- unfiltered order count. Align orders_count with the same paid filter.
CREATE OR REPLACE FUNCTION "public"."admin_revenue_series"("p_days" integer DEFAULT 30) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
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
            count(o.id) filter (where o.payment_status = 'paid') as orders_count
        from generate_series(current_date - (greatest(p_days, 1) - 1), current_date, interval '1 day') as gs(day)
        left join public.orders o on o.created_at::date = gs.day
        group by gs.day
    ) t;

    return v_result;
end;
$$;
