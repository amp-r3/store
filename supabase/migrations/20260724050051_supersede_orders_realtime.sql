-- Order status now flows through public.notifications (see
-- notify_on_order_and_review), which is durable and survives the client
-- being offline. The direct client-side Realtime subscription on orders is
-- superseded, so revert it.
alter publication supabase_realtime drop table "public"."orders";
alter table "public"."orders" replica identity default;
