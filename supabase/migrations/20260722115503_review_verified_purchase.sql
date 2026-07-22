-- Add a real "verified purchase" flag, set only by add_or_update_review (which
-- already requires a completed order), and close the RLS gap that let users
-- write product_reviews rows directly and forge it.

alter table "public"."product_reviews"
    add column "is_verified" boolean not null default false;

update "public"."product_reviews"
set "is_verified" = true
where "user_id" is not null;

drop policy if exists "Authenticated users can create reviews" on "public"."product_reviews";
drop policy if exists "Users can update own reviews" on "public"."product_reviews";

create or replace function "public"."add_or_update_review"("p_product_id" bigint, "p_rating" integer, "p_comment" "text") returns "public"."product_reviews"
    language "plpgsql" security definer
    set "search_path" to 'public', 'pg_temp'
    as $$
declare
  v_user_id uuid := auth.uid();
  v_review public.product_reviews;
  v_has_purchased boolean;
  v_comment text;
begin
  -- 1. Проверка авторизации
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- 2. Валидация рейтинга
  if p_rating is null or p_rating not between 1 and 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;

  -- 3. Санитизация комментария
  v_comment := nullif(trim(p_comment), '');
  if v_comment is not null and length(v_comment) > 2000 then
    raise exception 'Comment is too long (max 2000 characters)';
  end if;

  -- 4. Проверка существования товара
  if not exists (select 1 from public.products where id = p_product_id) then
    raise exception 'Product not found';
  end if;

  -- 5. Проверка факта покупки и статуса заказа 'completed'
  select exists (
    select 1
    from public.order_items oi
    join public.orders o on oi.order_id = o.id
    where o.user_id = v_user_id
      and oi.product_id = p_product_id
      and o.status = 'completed'::order_status
  ) into v_has_purchased;

  if not v_has_purchased then
    raise exception 'You can only review products from completed orders.';
  end if;

  -- 6. Добавление или обновление отзыва
  insert into public.product_reviews (product_id, user_id, rating, comment, is_verified)
  values (p_product_id, v_user_id, p_rating, v_comment, true)
  on conflict (product_id, user_id)
  do update set
    rating = excluded.rating,
    comment = excluded.comment,
    date = timezone('utc'::text, now()),
    is_edited = true,
    is_verified = true
  returning * into v_review;

  return v_review;
end;
$$;
