-- orders/order_items writes must go exclusively through public.create_order
-- (SECURITY DEFINER, bypasses RLS). The direct INSERT policies let any
-- authenticated user write arbitrary total_amount/price_at_purchase and set
-- status='completed' straight away, which also forges a "verified purchase"
-- for add_or_update_review. Client code only ever reads these tables
-- directly and writes via the RPC, so dropping the policies matches actual
-- usage and leaves the tables read-only to clients.
drop policy "Users can insert their own orders" on public.orders;
drop policy "Users can insert their own order items" on public.order_items;

drop policy "Allow public read" on public.product_reviews;
