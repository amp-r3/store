-- Rewrites order status derivation as a validated state machine.
--
-- Bugs fixed in sync_order_main_status():
--   * delivery_status = 'returned' hit no branch and fell through to
--     'pending' -- a returned order looked brand new.
--   * payment_status = 'refunded' was never checked -- a refunded+delivered
--     order read as 'completed', which is also the proof-of-purchase gate
--     for add_or_update_review().
-- Also adds: transition validation (admin_update_order_status could set any
-- value in any order, e.g. delivered -> awaiting_dispatch), and restock on
-- cancel/return (create_order decrements product_sizes.stock; nothing ever
-- gave it back).

-- ── Transition tables: single source of truth, read by both the RPC below
--    and the client (so the UI can grey out illegal options without
--    duplicating this matrix in TypeScript). Two separate tables rather than
--    one polymorphic one -- Postgres enforces each column's enum itself,
--    no "kind" discriminator to keep in sync by hand.
create table "public"."payment_status_transitions" (
    "from_status" "public"."payment_status" not null,
    "to_status" "public"."payment_status" not null,
    primary key ("from_status", "to_status")
);

create table "public"."delivery_status_transitions" (
    "from_status" "public"."delivery_status" not null,
    "to_status" "public"."delivery_status" not null,
    primary key ("from_status", "to_status")
);

insert into "public"."payment_status_transitions" ("from_status", "to_status") values
    ('awaiting_payment', 'paid'),
    ('awaiting_payment', 'failed'),
    ('paid', 'refunded'),
    ('failed', 'awaiting_payment');
    -- 'refunded' is terminal: no outgoing rows.

insert into "public"."delivery_status_transitions" ("from_status", "to_status") values
    ('awaiting_dispatch', 'dispatched'),
    ('awaiting_dispatch', 'cancelled'),
    ('dispatched', 'in_transit'),
    ('dispatched', 'cancelled'),
    ('in_transit', 'delivered'),
    ('in_transit', 'returned'),
    ('delivered', 'returned');
    -- 'returned' and 'cancelled' are terminal: no outgoing rows.

alter table "public"."payment_status_transitions" enable row level security;
alter table "public"."delivery_status_transitions" enable row level security;

-- Admin-read-only: these tables only ever change via migration, so there is
-- no write policy -- same pattern as admin_audit_log.
create policy "Admins can view payment status transitions" on "public"."payment_status_transitions"
    for select to "authenticated"
    using ((select public.is_admin()));

create policy "Admins can view delivery status transitions" on "public"."delivery_status_transitions"
    for select to "authenticated"
    using ((select public.is_admin()));

revoke all on table "public"."payment_status_transitions" from "anon", "authenticated";
grant select on table "public"."payment_status_transitions" to "authenticated", "service_role";
grant all on table "public"."payment_status_transitions" to "service_role";

revoke all on table "public"."delivery_status_transitions" from "anon", "authenticated";
grant select on table "public"."delivery_status_transitions" to "authenticated", "service_role";
grant all on table "public"."delivery_status_transitions" to "service_role";

-- ── Guard so restock-on-cancel/return can only ever fire once per order,
--    no matter how many more status updates happen after the terminal one.
alter table "public"."orders"
    add column "stock_restored" boolean not null default false;

-- ── Shared definition of "this order is done moving" -- used here instead
--    of repeating the four-value IN list at every call site (dashboard
--    stats today, more later).
create or replace function "public"."is_terminal_order_status"("p_status" "public"."order_status")
returns boolean
language sql
immutable
set search_path to 'public', 'pg_temp'
as $$
    select p_status in ('completed', 'cancelled', 'returned', 'refunded');
$$;

alter function "public"."is_terminal_order_status"("public"."order_status") owner to "postgres";
revoke all on function "public"."is_terminal_order_status"("public"."order_status") from public;
grant execute on function "public"."is_terminal_order_status"("public"."order_status") to "authenticated", "service_role";

-- ── Derivation + restock. Trigger definition itself (before update of
--    payment_status, delivery_status on orders) already exists and keeps
--    pointing at this function name -- only the body changes.
create or replace function "public"."sync_order_main_status"() returns "trigger"
    language "plpgsql"
    set "search_path" to 'public', 'pg_temp'
    as $$
begin
  -- 1. Refunded always wins: money has gone back regardless of delivery state.
  if NEW.payment_status = 'refunded'::public.payment_status then
    NEW.status := 'refunded'::public.order_status;

  -- 2. Sent back by the customer.
  elsif NEW.delivery_status = 'returned'::public.delivery_status then
    NEW.status := 'returned'::public.order_status;

  -- 3. Cancelled, or payment outright failed.
  elsif NEW.delivery_status = 'cancelled'::public.delivery_status
     or NEW.payment_status = 'failed'::public.payment_status then
    NEW.status := 'cancelled'::public.order_status;

  -- 4. Delivered and paid -- the only combination that counts as complete
  --    (this is also the review-eligibility gate in add_or_update_review()).
  elsif NEW.delivery_status = 'delivered'::public.delivery_status
    and NEW.payment_status = 'paid'::public.payment_status then
    NEW.status := 'completed'::public.order_status;

  -- 5. Delivered but not yet marked paid (cash_on_delivery before the admin
  --    confirms payment) -- still reads as in-flight, not completed.
  elsif NEW.delivery_status = 'delivered'::public.delivery_status then
    NEW.status := 'shipped'::public.order_status;

  -- 6. On its way.
  elsif NEW.delivery_status in ('dispatched'::public.delivery_status, 'in_transit'::public.delivery_status) then
    NEW.status := 'shipped'::public.order_status;

  -- 7. Paid, still waiting to ship.
  elsif NEW.payment_status = 'paid'::public.payment_status then
    NEW.status := 'processing'::public.order_status;

  -- 8. Everything else (e.g. awaiting_payment + awaiting_dispatch).
  else
    NEW.status := 'pending'::public.order_status;
  end if;

  -- Restock exactly once, the moment an order first lands on a terminal
  -- status that means the goods came back (not 'refunded' -- a refund on
  -- its own says nothing about the goods being returned, and 'completed' is
  -- a successful sale, not a return).
  if NEW.status in ('cancelled'::public.order_status, 'returned'::public.order_status)
     and not OLD.stock_restored then
    update public.product_sizes ps
    set stock = ps.stock + oi.quantity
    from public.order_items oi
    where oi.order_id = NEW.id
      and ps.id = oi.size_id;

    NEW.stock_restored := true;
  end if;

  return NEW;
end;
$$;

alter function "public"."sync_order_main_status"() owner to "postgres";

-- ── Admin write path. Same signature as before; body now validates every
--    requested transition against the tables above instead of writing
--    whatever the admin passed unconditionally.
create or replace function "public"."admin_update_order_status"(
    "p_order_id" "uuid",
    "p_payment_status" "public"."payment_status" default null::"public"."payment_status",
    "p_delivery_status" "public"."delivery_status" default null::"public"."delivery_status"
) returns "void"
    language "plpgsql"
    security definer
    set "search_path" to 'public', 'pg_temp'
    as $$
declare
    v_order public.orders;
    v_payment_method_code public.payment_method_type;
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

    select * into v_order from public.orders where id = p_order_id for update;

    if not found then
        raise exception 'Order not found';
    end if;

    -- Setting a status to its current value is a no-op, not an illegal
    -- transition -- e.g. a double-submit on the select shouldn't error.
    if p_payment_status is not null and p_payment_status = v_order.payment_status then
        p_payment_status := null;
    end if;

    if p_delivery_status is not null and p_delivery_status = v_order.delivery_status then
        p_delivery_status := null;
    end if;

    if p_payment_status is not null and not exists (
        select 1 from public.payment_status_transitions
        where from_status = v_order.payment_status and to_status = p_payment_status
    ) then
        raise exception 'Illegal payment transition: % -> %', v_order.payment_status, p_payment_status;
    end if;

    if p_delivery_status is not null and not exists (
        select 1 from public.delivery_status_transitions
        where from_status = v_order.delivery_status and to_status = p_delivery_status
    ) then
        raise exception 'Illegal delivery transition: % -> %', v_order.delivery_status, p_delivery_status;
    end if;

    -- cash_on_delivery: marking the order delivered *is* the payment event --
    -- there's no separate online charge to reconcile. Only kicks in from the
    -- ordinary awaiting_payment starting point; a payment already marked
    -- failed/paid/refunded is left for the admin to resolve explicitly.
    if p_delivery_status = 'delivered'::public.delivery_status
       and v_order.payment_status = 'awaiting_payment'::public.payment_status then
        select code into v_payment_method_code
        from public.payment_methods where id = v_order.payment_method_id;

        if v_payment_method_code = 'cash_on_delivery'::public.payment_method_type then
            p_payment_status := 'paid'::public.payment_status;
        end if;
    end if;

    update public.orders
    set
        payment_status = coalesce(p_payment_status, orders.payment_status),
        delivery_status = coalesce(p_delivery_status, orders.delivery_status)
    where orders.id = p_order_id;

    perform public.log_admin_action(
        'order.status_update',
        'order',
        p_order_id::text,
        jsonb_build_object('payment_status', v_order.payment_status, 'delivery_status', v_order.delivery_status),
        jsonb_build_object(
            'payment_status', coalesce(p_payment_status, v_order.payment_status),
            'delivery_status', coalesce(p_delivery_status, v_order.delivery_status)
        )
    );
end;
$$;

alter function "public"."admin_update_order_status"("p_order_id" "uuid", "p_payment_status" "public"."payment_status", "p_delivery_status" "public"."delivery_status")
    owner to "postgres";

-- ── Notification labels: add the two new terminal statuses. The existing
--    `case` has no `else`, so an unmatched status silently produced _label
--    = null and no notification was sent at all.
create or replace function "public"."handle_order_notifications"() returns "trigger"
    language "plpgsql" security definer
    set "search_path" to 'public', 'pg_temp'
    as $$
declare
  _label text;
  _level public.notification_level;
begin
  if NEW.delivery_status is distinct from OLD.delivery_status then
    _label := case NEW.delivery_status
      when 'awaiting_dispatch' then 'Awaiting Dispatch'
      when 'dispatched' then 'Dispatched'
      when 'in_transit' then 'In Transit'
      when 'delivered' then 'Delivered'
      when 'returned' then 'Returned'
      when 'cancelled' then 'Cancelled'
    end;
    _level := case
      when NEW.delivery_status in ('cancelled', 'returned') then 'error'
      when NEW.delivery_status = 'delivered' then 'success'
      else 'info'
    end;
  elsif NEW.payment_status is distinct from OLD.payment_status then
    _label := case NEW.payment_status
      when 'awaiting_payment' then 'Awaiting Payment'
      when 'paid' then 'Paid Successfully'
      when 'failed' then 'Payment Failed'
      when 'refunded' then 'Refunded'
    end;
    _level := case
      when NEW.payment_status = 'failed' then 'error'
      when NEW.payment_status = 'paid' then 'success'
      else 'info'
    end;
  elsif NEW.status is distinct from OLD.status then
    _label := case NEW.status
      when 'pending' then 'Pending'
      when 'processing' then 'Processing'
      when 'shipped' then 'Shipped'
      when 'completed' then 'Completed'
      when 'cancelled' then 'Cancelled'
      when 'returned' then 'Returned'
      when 'refunded' then 'Refunded'
    end;
    _level := case
      when NEW.status in ('cancelled', 'returned', 'refunded') then 'error'
      when NEW.status = 'completed' then 'success'
      else 'info'
    end;
  else
    _label := null;
  end if;

  if _label is not null then
    insert into public.notifications (user_id, category, level, title, action_path, entity_id)
    values (
      NEW.user_id,
      'order_status',
      _level,
      'Order ' || coalesce(NEW.order_number, NEW.id::text) || ' — ' || _label,
      '/user/orders',
      NEW.id::text
    );
  end if;

  if NEW.delivery_status = 'delivered'::public.delivery_status and OLD.delivery_status is distinct from 'delivered'::public.delivery_status then
    insert into public.notifications (user_id, category, level, title, body, action_path, entity_id)
    values (
      NEW.user_id,
      'review_reminder',
      'info',
      'Share your experience',
      'Your order was delivered — leave a review',
      '/user/reviews',
      NEW.id::text
    );
  end if;

  return NEW;
end;
$$;

alter function "public"."handle_order_notifications"() owner to "postgres";

-- ── Dashboard stats: use the shared terminal-status helper instead of
--    repeating a two-value IN list that's now missing 'returned'/'refunded'.
create or replace function "public"."admin_dashboard_stats"() returns "jsonb"
    language "plpgsql" stable security definer
    set "search_path" to 'public', 'pg_temp'
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
            where not public.is_terminal_order_status(status)),
        'orders_awaiting_payment', (select count(*) from public.orders
            where payment_status = 'awaiting_payment' and not public.is_terminal_order_status(status)),
        'orders_awaiting_dispatch', (select count(*) from public.orders
            where delivery_status = 'awaiting_dispatch' and not public.is_terminal_order_status(status)),
        'revenue_total', (select coalesce(sum(total_amount), 0) from public.orders
            where payment_status = 'paid'),
        'customers_total', (select count(*) from public.profiles),
        'products_total', (select count(*) from public.products)
    ) into v_stats;

    return v_stats;
end;
$$;

alter function "public"."admin_dashboard_stats"() owner to "postgres";
