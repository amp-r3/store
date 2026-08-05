-- Per-order status history, so the customer/admin order-detail views can show
-- a timeline with real dates instead of just the current status. orders only
-- ever carried created_at/updated_at -- no record of *when* each individual
-- payment_status/delivery_status transition happened. This adds an
-- append-only event log written by a trigger, never by clients directly.

create table "public"."order_status_events" (
    "id" uuid default gen_random_uuid() not null,
    "order_id" uuid not null,
    "status" "public"."order_status" not null,
    "payment_status" "public"."payment_status" not null,
    "delivery_status" "public"."delivery_status" not null,
    "created_at" timestamp with time zone default now() not null
);

alter table only "public"."order_status_events"
    add constraint "order_status_events_pkey" primary key ("id");

alter table only "public"."order_status_events"
    add constraint "order_status_events_order_id_fkey" foreign key ("order_id")
        references "public"."orders"("id") on delete cascade;

create index "order_status_events_order_created_idx" on "public"."order_status_events"
    using btree ("order_id", "created_at");

alter table "public"."order_status_events" enable row level security;

-- Read-only from the client's perspective -- rows are written exclusively by
-- the trigger below (security definer), same pattern as admin_audit_log /
-- payment_status_transitions: no insert/update/delete policy at all.
revoke all on table "public"."order_status_events" from "anon", "authenticated";
grant select on table "public"."order_status_events" to "authenticated", "service_role";
grant all on table "public"."order_status_events" to "service_role";

create policy "Users can view their own order status events" on "public"."order_status_events"
    for select to "authenticated"
    using ((exists (
        select 1 from public.orders o
        where o.id = order_status_events.order_id
          and o.user_id = (select auth.uid())
    )));

create policy "Admins can view all order status events" on "public"."order_status_events"
    for select to "authenticated"
    using ((select public.is_admin()));

-- ── Trigger: append a row whenever an order is created or its derived status
--    / payment_status / delivery_status change. AFTER, not BEFORE, so it
--    reads NEW.status once sync_order_main_status() (a BEFORE trigger) has
--    already derived the final value for this same statement.
create or replace function "public"."record_order_status_event"() returns "trigger"
    language "plpgsql" security definer
    set "search_path" to 'public', 'pg_temp'
    as $$
begin
  insert into public.order_status_events (order_id, status, payment_status, delivery_status)
  values (NEW.id, NEW.status, NEW.payment_status, NEW.delivery_status);

  return NEW;
end;
$$;

alter function "public"."record_order_status_event"() owner to "postgres";

create trigger "record_order_status_event_trigger"
    after insert or update of "payment_status", "delivery_status" on "public"."orders"
    for each row execute function "public"."record_order_status_event"();

-- ── Backfill for orders that already existed before this table did. Every
--    order started out pending/awaiting_payment/awaiting_dispatch (the
--    column defaults on public.orders), so that's the synthetic first event,
--    timestamped at created_at. If the order has since moved on, a second
--    event captures where it stands today, timestamped at updated_at -- the
--    exact intermediate transitions were never recorded and can't be
--    reconstructed, so the backfilled timeline is intentionally coarse.
insert into public.order_status_events (order_id, status, payment_status, delivery_status, created_at)
select id, 'pending'::public.order_status, 'awaiting_payment'::public.payment_status,
       'awaiting_dispatch'::public.delivery_status, created_at
from public.orders;

insert into public.order_status_events (order_id, status, payment_status, delivery_status, created_at)
select id, status, payment_status, delivery_status, updated_at
from public.orders
where status is distinct from 'pending'::public.order_status
   or payment_status is distinct from 'awaiting_payment'::public.payment_status
   or delivery_status is distinct from 'awaiting_dispatch'::public.delivery_status;
