-- Enable Realtime on orders so clients can subscribe to their own status
-- changes (payment/delivery/order status) without polling. REPLICA IDENTITY
-- FULL is required so change payloads include the old row values, letting
-- clients distinguish a real status change from any other UPDATE on the row
-- (e.g. the updated_at bump from set_orders_updated_at).
alter table "public"."orders" replica identity full;

alter publication supabase_realtime add table "public"."orders";
