-- Captures the price a user saw when adding to their wishlist, so a later
-- drop in products.price (a generated column: base_price minus discount) can
-- be detected regardless of whether base_price fell or discount rose.
alter table "public"."wishlist_items" add column "price_at_add" numeric(10,2);

create or replace function "public"."handle_wishlist_price_drop"() returns "trigger"
    language "plpgsql" security definer
    set "search_path" to 'public', 'pg_temp'
    as $$
begin
  insert into public.notifications (user_id, category, level, title, body, action_path, entity_id)
  select wi.user_id, 'price_drop', 'success', 'Price drop',
         NEW.title || ' is now cheaper', '/wishlist', NEW.id::text
  from public.wishlist_items wi
  where wi.product_id = NEW.id
    and (wi.price_at_add is null or NEW.price < wi.price_at_add);

  return NEW;
end;
$$;

create or replace trigger "notify_on_price_drop" after update on "public"."products"
  for each row when (NEW.price < OLD.price) execute function "public"."handle_wishlist_price_drop"();
