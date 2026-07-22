create or replace function public.get_review_stats(p_product_id bigint)
returns table("rating" integer, "review_count" bigint)
    language sql stable
    as $$
  select pr.rating, count(*)::bigint as review_count
  from public.product_reviews pr
  where pr.product_id = p_product_id
  group by pr.rating
  order by pr.rating desc;
$$;

-- Sort/filter paths the paginated review list now hits. No index on
-- product_id existed before (only the (product_id, user_id) unique constraint).
create index if not exists idx_product_reviews_product_date
    on public.product_reviews using btree (product_id, "date" desc);
create index if not exists idx_product_reviews_product_rating
    on public.product_reviews using btree (product_id, rating);
create index if not exists idx_product_reviews_product_helpful
    on public.product_reviews using btree (product_id, helpful_count desc);
