-- Neither function is SECURITY DEFINER, so this isn't a privilege-escalation
-- vector like the earlier definer functions — but get_unreviewed_purchases
-- references order_items/orders/product_reviews unqualified, relying on the
-- caller's search_path to resolve them, which is exactly what the
-- function_search_path_mutable lint flags. Pin search_path on both to
-- close the warning and make resolution explicit. Bodies are unchanged.

CREATE OR REPLACE FUNCTION "public"."get_review_stats"("p_product_id" bigint) RETURNS TABLE("rating" integer, "review_count" bigint)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select pr.rating, count(*)::bigint as review_count
  from public.product_reviews pr
  where pr.product_id = p_product_id
  group by pr.rating
  order by pr.rating desc;
$$;


CREATE OR REPLACE FUNCTION "public"."get_unreviewed_purchases"() RETURNS TABLE("product_id" bigint, "last_purchased_at" timestamp with time zone, "purchase_count" bigint)
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$select oi.product_id,
       max(o.created_at) as last_purchased_at,
       count(*)          as purchase_count
from order_items oi
join orders o on o.id = oi.order_id
where o.user_id = auth.uid()
  and o.status = 'completed'
  and not exists (
    select 1 from product_reviews pr
    where pr.product_id = oi.product_id
      and pr.user_id = auth.uid()
  )
group by oi.product_id
order by last_purchased_at desc;$$;
