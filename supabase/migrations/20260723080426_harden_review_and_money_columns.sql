-- reviewer_name is dead PII-shaped surface: add_or_update_review never sets
-- it (real reviews resolve the display name from public_profiles.username),
-- and it was world-readable via the "Anyone can view reviews" USING (true)
-- policy. Drop it for consistency with the earlier reviewer_email removal.
alter table public.product_reviews drop column reviewer_name;

-- Defense-in-depth: nothing in the client can set these negative today
-- (create_order reads price server-side, add_or_update_review doesn't touch
-- money/stock), but a service_role mistake or future policy change shouldn't
-- be able to produce a negative price or stock count.
alter table public.products
  add constraint products_base_price_nonneg check (base_price >= 0);

alter table public.product_sizes
  add constraint product_sizes_stock_nonneg check (stock >= 0);

alter table public.order_items
  add constraint order_items_price_at_purchase_nonneg check (price_at_purchase >= 0);
