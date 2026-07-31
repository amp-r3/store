Initialising login role...
Dumping schemas from remote database...



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."delivery_method_type" AS ENUM (
    'standard',
    'express',
    'pickup'
);


ALTER TYPE "public"."delivery_method_type" OWNER TO "postgres";


CREATE TYPE "public"."delivery_status" AS ENUM (
    'awaiting_dispatch',
    'dispatched',
    'in_transit',
    'delivered',
    'returned',
    'cancelled'
);


ALTER TYPE "public"."delivery_status" OWNER TO "postgres";


CREATE TYPE "public"."notification_category" AS ENUM (
    'order_status',
    'review_reminder',
    'price_drop',
    'system'
);


ALTER TYPE "public"."notification_category" OWNER TO "postgres";


CREATE TYPE "public"."notification_level" AS ENUM (
    'info',
    'success',
    'warning',
    'error'
);


ALTER TYPE "public"."notification_level" OWNER TO "postgres";


CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'processing',
    'shipped',
    'completed',
    'cancelled',
    'returned',
    'refunded'
);


ALTER TYPE "public"."order_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_method_type" AS ENUM (
    'cash_on_delivery',
    'online_card',
    'paypal',
    'sepa',
    'klarna'
);


ALTER TYPE "public"."payment_method_type" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'awaiting_payment',
    'paid',
    'failed',
    'refunded'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'user',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."product_reviews" (
    "id" bigint NOT NULL,
    "product_id" bigint NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "date" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "helpful_count" integer DEFAULT 0 NOT NULL,
    "is_edited" boolean DEFAULT false NOT NULL,
    "is_verified" boolean DEFAULT false NOT NULL,
    CONSTRAINT "product_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."product_reviews" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_or_update_review"("p_product_id" bigint, "p_rating" integer, "p_comment" "text") RETURNS "public"."product_reviews"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
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


ALTER FUNCTION "public"."add_or_update_review"("p_product_id" bigint, "p_rating" integer, "p_comment" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_archive_product"("p_id" bigint, "p_archived" boolean) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_before boolean;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select is_archived into v_before from public.products where id = p_id;
    if not found then
        raise exception 'Product not found';
    end if;

    update public.products set is_archived = p_archived where id = p_id;

    perform public.log_admin_action(
        'product.archive', 'product', p_id::text,
        jsonb_build_object('is_archived', v_before), jsonb_build_object('is_archived', p_archived)
    );
end;
$$;


ALTER FUNCTION "public"."admin_archive_product"("p_id" bigint, "p_archived" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_create_product"("p_payload" "jsonb") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_id bigint;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    insert into public.products (
        title, description, category_id, base_price, discount_percentage,
        thumbnail, images, tags, brand, sku, weight, dimensions,
        warranty_information, shipping_information, availability_status,
        return_policy, minimum_order_quantity, meta
    ) values (
        p_payload->>'title',
        p_payload->>'description',
        nullif(p_payload->>'category_id', '')::bigint,
        (p_payload->>'base_price')::numeric,
        coalesce((p_payload->>'discount_percentage')::numeric, 0),
        p_payload->>'thumbnail',
        coalesce((select array_agg(value) from jsonb_array_elements_text(p_payload->'images')), '{}'),
        coalesce((select array_agg(value) from jsonb_array_elements_text(p_payload->'tags')), '{}'),
        p_payload->>'brand',
        p_payload->>'sku',
        nullif(p_payload->>'weight', '')::numeric,
        coalesce(p_payload->'dimensions', '{"depth":0,"width":0,"height":0}'::jsonb),
        p_payload->>'warranty_information',
        p_payload->>'shipping_information',
        p_payload->>'availability_status',
        p_payload->>'return_policy',
        coalesce((p_payload->>'minimum_order_quantity')::integer, 1),
        jsonb_build_object(
            'createdAt', now(),
            'updatedAt', now(),
            'barcode', coalesce(p_payload->'meta'->>'barcode', ''),
            'qrCode', coalesce(p_payload->'meta'->>'qrCode', '')
        )
    )
    returning id into v_id;

    perform public.log_admin_action('product.create', 'product', v_id::text, null, p_payload);

    return v_id;
end;
$$;


ALTER FUNCTION "public"."admin_create_product"("p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_dashboard_stats"() RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
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


ALTER FUNCTION "public"."admin_dashboard_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_category"("p_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_before jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select to_jsonb(c) into v_before from public.categories c where c.id = p_id;
    if v_before is null then
        raise exception 'Category not found';
    end if;

    delete from public.categories where id = p_id;

    perform public.log_admin_action('category.delete', 'category', p_id::text, v_before, null);
end;
$$;


ALTER FUNCTION "public"."admin_delete_category"("p_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_product_size"("p_size_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_before jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select to_jsonb(ps) into v_before from public.product_sizes ps where ps.id = p_size_id;
    if v_before is null then
        raise exception 'Product size not found';
    end if;

    -- order_items.size_id is `on delete restrict` -- a size already sold
    -- against correctly fails here instead of silently corrupting history.
    delete from public.product_sizes where id = p_size_id;

    perform public.log_admin_action('product_size.delete', 'product_size', p_size_id::text, v_before, null);
end;
$$;


ALTER FUNCTION "public"."admin_delete_product_size"("p_size_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_stock"("p_size_id" bigint, "p_stock" integer) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_before integer;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    if p_stock < 0 then
        raise exception 'Stock cannot be negative';
    end if;

    select stock into v_before from public.product_sizes where id = p_size_id;
    if not found then
        raise exception 'Product size not found';
    end if;

    update public.product_sizes set stock = p_stock where id = p_size_id;

    perform public.log_admin_action(
        'product_size.set_stock', 'product_size', p_size_id::text,
        jsonb_build_object('stock', v_before), jsonb_build_object('stock', p_stock)
    );
end;
$$;


ALTER FUNCTION "public"."admin_set_stock"("p_size_id" bigint, "p_stock" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_set_user_role"("p_user_id" "uuid", "p_role" "public"."user_role") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_before public.user_role;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    if p_user_id = auth.uid() then
        raise exception 'Cannot change your own role';
    end if;

    select role into v_before from public.profiles where id = p_user_id;
    if not found then
        raise exception 'User not found';
    end if;

    if v_before = 'admin'::public.user_role and p_role <> 'admin'::public.user_role
       and (select count(*) from public.profiles where role = 'admin'::public.user_role) <= 1 then
        raise exception 'Cannot demote the last admin';
    end if;

    update public.profiles set role = p_role where id = p_user_id;

    perform public.log_admin_action(
        'user.set_role', 'profile', p_user_id::text,
        jsonb_build_object('role', v_before), jsonb_build_object('role', p_role)
    );
end;
$$;


ALTER FUNCTION "public"."admin_set_user_role"("p_user_id" "uuid", "p_role" "public"."user_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_order_status"("p_order_id" "uuid", "p_payment_status" "public"."payment_status" DEFAULT NULL::"public"."payment_status", "p_delivery_status" "public"."delivery_status" DEFAULT NULL::"public"."delivery_status") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
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


ALTER FUNCTION "public"."admin_update_order_status"("p_order_id" "uuid", "p_payment_status" "public"."payment_status", "p_delivery_status" "public"."delivery_status") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_product"("p_id" bigint, "p_payload" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_before jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select to_jsonb(p) into v_before from public.products p where p.id = p_id;
    if v_before is null then
        raise exception 'Product not found';
    end if;

    update public.products set
        title = coalesce(p_payload->>'title', title),
        description = coalesce(p_payload->>'description', description),
        category_id = case when p_payload ? 'category_id'
            then nullif(p_payload->>'category_id', '')::bigint else category_id end,
        base_price = coalesce((p_payload->>'base_price')::numeric, base_price),
        discount_percentage = coalesce((p_payload->>'discount_percentage')::numeric, discount_percentage),
        thumbnail = coalesce(p_payload->>'thumbnail', thumbnail),
        images = case when p_payload ? 'images'
            then coalesce((select array_agg(value) from jsonb_array_elements_text(p_payload->'images')), '{}')
            else images end,
        tags = case when p_payload ? 'tags'
            then coalesce((select array_agg(value) from jsonb_array_elements_text(p_payload->'tags')), '{}')
            else tags end,
        brand = coalesce(p_payload->>'brand', brand),
        sku = coalesce(p_payload->>'sku', sku),
        weight = case when p_payload ? 'weight'
            then nullif(p_payload->>'weight', '')::numeric else weight end,
        dimensions = coalesce(p_payload->'dimensions', dimensions),
        warranty_information = coalesce(p_payload->>'warranty_information', warranty_information),
        shipping_information = coalesce(p_payload->>'shipping_information', shipping_information),
        availability_status = coalesce(p_payload->>'availability_status', availability_status),
        return_policy = coalesce(p_payload->>'return_policy', return_policy),
        minimum_order_quantity = coalesce((p_payload->>'minimum_order_quantity')::integer, minimum_order_quantity),
        meta = jsonb_build_object(
            'createdAt', meta->>'createdAt',
            'updatedAt', now(),
            'barcode', coalesce(p_payload->'meta'->>'barcode', meta->>'barcode'),
            'qrCode', coalesce(p_payload->'meta'->>'qrCode', meta->>'qrCode')
        )
    where id = p_id;

    perform public.log_admin_action('product.update', 'product', p_id::text, v_before, p_payload);
end;
$$;


ALTER FUNCTION "public"."admin_update_product"("p_id" bigint, "p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_upsert_category"("p_id" bigint, "p_name" "text", "p_slug" "text") RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_id bigint;
    v_before jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    if p_id is null then
        insert into public.categories (name, slug) values (p_name, p_slug) returning id into v_id;
        perform public.log_admin_action('category.create', 'category', v_id::text, null,
            jsonb_build_object('name', p_name, 'slug', p_slug));
    else
        select to_jsonb(c) into v_before from public.categories c where c.id = p_id;
        if v_before is null then
            raise exception 'Category not found';
        end if;

        update public.categories set name = p_name, slug = p_slug where id = p_id;
        v_id := p_id;
        perform public.log_admin_action('category.update', 'category', p_id::text, v_before,
            jsonb_build_object('name', p_name, 'slug', p_slug));
    end if;

    return v_id;
end;
$$;


ALTER FUNCTION "public"."admin_upsert_category"("p_id" bigint, "p_name" "text", "p_slug" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_upsert_product_size"("p_product_id" bigint, "p_value" "text", "p_stock" integer) RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_id bigint;
    v_before jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select to_jsonb(ps) into v_before
    from public.product_sizes ps where ps.product_id = p_product_id and ps.value = p_value;

    insert into public.product_sizes (product_id, value, stock)
    values (p_product_id, p_value, p_stock)
    on conflict (product_id, value) do update set stock = excluded.stock
    returning id into v_id;

    perform public.log_admin_action(
        case when v_before is null then 'product_size.create' else 'product_size.update' end,
        'product_size', v_id::text, v_before, jsonb_build_object('product_id', p_product_id, 'value', p_value, 'stock', p_stock)
    );

    return v_id;
end;
$$;


ALTER FUNCTION "public"."admin_upsert_product_size"("p_product_id" bigint, "p_value" "text", "p_stock" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_order"("p_items" "jsonb", "p_delivery_method_id" "uuid", "p_payment_method_id" "uuid", "p_shipping_address" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$declare
  v_order_id uuid;
  v_order_number text;
  v_items_total numeric(10, 2) := 0;

  -- Variables for delivery
  v_delivery_cost numeric(10, 2) := 0;
  v_dm_price numeric(10, 2);
  v_dm_free_from numeric(10, 2);
  v_dm_is_active boolean;

  -- Variables for payment
  v_pm_fee_percentage numeric(5, 2);
  v_pm_fee_fixed numeric(10, 2);
  v_pm_is_active boolean;
  v_payment_fee numeric(10, 2) := 0;
  v_final_total numeric(10, 2) := 0;

begin
  -- 0. Проверка на пустую корзину
  IF p_items is null or jsonb_array_length(p_items) = 0 then
    RAISE EXCEPTION 'Cart is empty. Cannot create order.';
  end IF;

  -- Защита от отрицательного количества
  IF exists (
    select 1
    from jsonb_array_elements(p_items) as i
    where (i ->> 'quantity')::int <= 0
  ) then
    RAISE EXCEPTION 'Quantity must be greater than zero.';
  end IF;

  -- Агрегируем дубли size_id и фиксируем цену один раз
  create temp table tmp_order_items on commit drop as
  select
    ps.id as size_id,
    ps.product_id as product_id,
    p.price as price,
    sum((i ->> 'quantity')::int) as qty
  from jsonb_array_elements(p_items) as i
    join public.product_sizes ps on ps.id = (i ->> 'size_id')::bigint
    join public.products p on p.id = ps.product_id
  group by ps.id, ps.product_id, p.price;

  -- Проверяем, что все переданные size_id реально существуют
  IF (select count(*) from tmp_order_items) <> (
        select count(distinct (i ->> 'size_id')::bigint) from jsonb_array_elements(p_items) as i
      ) then
    RAISE EXCEPTION 'One or more items/sizes do not exist.';
  end IF;

  -- 1. Блокировка строк размеров (FOR UPDATE) и подсчет суммы
  PERFORM 1
  from public.product_sizes ps
  where ps.id in (select size_id from tmp_order_items)
  order by ps.id
  for update of ps;

  select coalesce(sum(t.price * t.qty), 0) into v_items_total
  from tmp_order_items t;

  -- Проверяем остатки по агрегированному количеству
  IF exists (
    select 1
    from tmp_order_items t
      join public.product_sizes ps on ps.id = t.size_id
    where ps.stock < t.qty
  ) then
    RAISE EXCEPTION 'One or more items/sizes are out of stock.';
  end IF;

  IF v_items_total = 0 then
    RAISE EXCEPTION 'Items total price is zero.';
  end IF;

  -- 2. Обработка метода доставки
  select price, free_from_price, is_active
  into v_dm_price, v_dm_free_from, v_dm_is_active
  from public.delivery_methods
  where id = p_delivery_method_id;

  IF not FOUND or not coalesce(v_dm_is_active, false) then
    RAISE EXCEPTION 'Selected delivery method is unavailable.';
  end IF;

  -- 3. Обработка метода оплаты
  select fee_percentage, fee_fixed, is_active
  into v_pm_fee_percentage, v_pm_fee_fixed, v_pm_is_active
  from public.payment_methods
  where id = p_payment_method_id;

  IF not FOUND or not coalesce(v_pm_is_active, false) then
    RAISE EXCEPTION 'Selected payment method is unavailable.';
  end IF;

  -- Логика стоимости доставки
  IF v_dm_free_from is not null and v_items_total >= v_dm_free_from then
    v_delivery_cost := 0.00;
  else
    v_delivery_cost := coalesce(v_dm_price, 0.00);
  end IF;

  -- Расчет комиссии за оплату
  v_payment_fee := round(
    ((v_items_total + v_delivery_cost) * (coalesce(v_pm_fee_percentage, 0) / 100))
    + coalesce(v_pm_fee_fixed, 0),
    2
  );

  -- Итоговая сумма
  v_final_total := v_items_total + v_delivery_cost + v_payment_fee;

  -- Генерация номера заказа
  v_order_number := to_char(now(), 'YYMM') || '-' || nextval('public.order_number_seq')::text;

  -- 4. Создание записи в таблице orders
  insert into public.orders (
    user_id,
    shipping_address,
    payment_method_id,
    delivery_method_id,
    delivery_cost,
    payment_fee,
    total_amount,
    order_number
  )
  values (
    auth.uid(),
    p_shipping_address,
    p_payment_method_id,
    p_delivery_method_id,
    v_delivery_cost,
    v_payment_fee,
    v_final_total,
    v_order_number
  )
  returning id into v_order_id;

  -- 5. Создание записей в order_items
  insert into public.order_items (
    order_id, product_id, size_id, quantity, price_at_purchase
  )
  select v_order_id, t.product_id, t.size_id, t.qty, t.price
  from tmp_order_items t;

  -- 6. Списание остатков конкретного размера (Stock update)
  update public.product_sizes ps
  set stock = ps.stock - t.qty
  from tmp_order_items t
  where ps.id = t.size_id;

  -- Возврат JSON с ID заказа и его номером
  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
end;$$;


ALTER FUNCTION "public"."create_order"("p_items" "jsonb", "p_delivery_method_id" "uuid", "p_payment_method_id" "uuid", "p_shipping_address" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_last_purchase_date"("p_product_id" bigint) RETURNS timestamp with time zone
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_purchase_date timestamp with time zone;
  v_has_reviewed boolean;
BEGIN
  -- Если гость - возвращаем null
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- 1. Сначала проверяем, оставлял ли пользователь уже отзыв
  SELECT EXISTS (
    SELECT 1 FROM public.product_reviews
    WHERE product_id = p_product_id AND user_id = v_user_id
  ) INTO v_has_reviewed;

  -- Если отзыв уже есть - плашка не нужна, возвращаем NULL
  IF v_has_reviewed THEN
    RETURN NULL;
  END IF;

  -- 2. Если отзыва нет, ищем только ЗАВЕРШЕННУЮ покупку
  SELECT o.created_at INTO v_purchase_date
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  WHERE o.user_id = v_user_id
    AND oi.product_id = p_product_id
    AND o.status = 'completed' -- Строгое условие на статус заказа
  ORDER BY o.created_at DESC
  LIMIT 1;

  -- Вернется либо дата покупки, либо NULL (если покупок не было)
  RETURN v_purchase_date;
END;
$$;


ALTER FUNCTION "public"."get_last_purchase_date"("p_product_id" bigint) OWNER TO "postgres";


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


ALTER FUNCTION "public"."get_review_stats"("p_product_id" bigint) OWNER TO "postgres";


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


ALTER FUNCTION "public"."get_unreviewed_purchases"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$declare
  final_nick text;
  first_n text;
  last_n text;
  meta jsonb := new.raw_user_meta_data;
  base_nick text;
  attempt int := 0;
  nick_taken boolean;
begin
  -- 1. Имя и фамилия
  first_n := coalesce(
    nullif(trim(meta->>'firstName'), ''),
    nullif(trim(meta->>'first_name'), ''),
    nullif(trim(split_part(meta->>'full_name', ' ', 1)), ''),
    nullif(trim(split_part(meta->>'name', ' ', 1)), '')
  );

  last_n := coalesce(
    nullif(trim(meta->>'lastName'), ''),
    nullif(trim(meta->>'last_name'), ''),
    nullif(trim(substring(meta->>'full_name' from ' (.*)')), ''),
    nullif(trim(substring(meta->>'name' from ' (.*)')), '')
  );

  -- 2. Формируем base_nick (без цифр — база для генерации)
  if nullif(trim(meta->>'username'), '') is not null then
    base_nick := trim(meta->>'username');

  elsif nullif(trim(meta->>'preferred_username'), '') is not null then
    base_nick := trim(meta->>'preferred_username');

  elsif first_n is not null then
    base_nick := lower(regexp_replace(first_n, '[^a-zA-Zа-яА-Я0-9]', '', 'g'));

  elsif new.email is not null then
    base_nick := split_part(new.email, '@', 1);

  else
    base_nick := 'user';
  end if;

  -- 3. Пробуем занять никнейм — до 10 попыток
  loop
    if attempt = 0 then
      -- Первая попытка — без цифр (preferred_username, username)
      final_nick := base_nick;
    elsif attempt <= 10 then
      -- Следующие попытки — добавляем случайные 5 цифр
      final_nick := base_nick || '_' || floor(random() * 90000 + 10000)::text;
    else
      -- Исчерпали попытки — используем sub, он гарантированно уникален
      final_nick := 'user_' || coalesce(
        nullif(trim(meta->>'sub'), ''),
        floor(random() * 900000000)::text
      );
      exit; -- выходим из цикла, этот точно свободен
    end if;

    -- Проверяем занят ли никнейм
    select exists(
      select 1 from public.profiles where username = final_nick
    ) into nick_taken;

    exit when not nick_taken; -- свободен — выходим
    attempt := attempt + 1;
  end loop;

  -- 4. Вставка в profiles
  insert into public.profiles (id, username, first_name, last_name, avatar_url)
  values (
    new.id,
    final_nick,
    first_n,
    last_n,
    coalesce(
      nullif(trim(meta->>'picture'), ''),
      nullif(trim(meta->>'avatar_url'), ''),
      nullif(trim(meta->>'photo_url'), '')
    )
  );

  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_order_notifications"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
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


ALTER FUNCTION "public"."handle_order_notifications"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_wishlist_price_drop"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
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


ALTER FUNCTION "public"."handle_wishlist_price_drop"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
    select exists (
        select 1
        from public.profiles p
        where p.id = (select auth.uid())
          and p.role = 'admin'::public.user_role
    );
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_terminal_order_status"("p_status" "public"."order_status") RETURNS boolean
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
    select p_status in ('completed', 'cancelled', 'returned', 'refunded');
$$;


ALTER FUNCTION "public"."is_terminal_order_status"("p_status" "public"."order_status") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_admin_action"("p_action" "text", "p_entity_type" "text", "p_entity_id" "text" DEFAULT NULL::"text", "p_before" "jsonb" DEFAULT NULL::"jsonb", "p_after" "jsonb" DEFAULT NULL::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
    v_actor_id uuid := auth.uid();
    v_actor_username text;
begin
    select username into v_actor_username from public.profiles where id = v_actor_id;

    insert into public.admin_audit_log (actor_id, actor_username, action, entity_type, entity_id, before, after)
    values (v_actor_id, v_actor_username, p_action, p_entity_type, p_entity_id, p_before, p_after);
end;
$$;


ALTER FUNCTION "public"."log_admin_action"("p_action" "text", "p_entity_type" "text", "p_entity_id" "text", "p_before" "jsonb", "p_after" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_order_main_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
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


ALTER FUNCTION "public"."sync_order_main_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_review_like"("p_review_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_exists boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Проверяем, стоит ли уже лайк
  SELECT EXISTS (
    SELECT 1 FROM public.review_likes
    WHERE review_id = p_review_id AND user_id = v_user_id
  ) INTO v_exists;

  IF v_exists THEN
    -- Если стоит, убираем
    DELETE FROM public.review_likes
    WHERE review_id = p_review_id AND user_id = v_user_id;
    RETURN false; -- Возвращает false (лайк снят)
  ELSE
    -- Если не стоит, ставим
    INSERT INTO public.review_likes (review_id, user_id)
    VALUES (p_review_id, v_user_id);
    RETURN true; -- Возвращает true (лайк поставлен)
  END IF;
END;
$$;


ALTER FUNCTION "public"."toggle_review_like"("p_review_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_product_rating"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
declare
  _product_id bigint;
begin
  -- Понимаем, к какому товару относится отзыв, в зависимости от действия
  if (TG_OP = 'DELETE') then
    _product_id := OLD.product_id;
  else
    _product_id := NEW.product_id;
  end if;

  -- Обновляем средний рейтинг и счетчик отзывов в таблице продуктов
  update public.products
  set
    rating = coalesce((
      select round(avg(rating)::numeric, 2)
      from public.product_reviews
      where product_id = _product_id
    ), 0),
    reviews_count = (
      select count(*)
      from public.product_reviews
      where product_id = _product_id
    )
  where id = _product_id;

  return null;
end;
$$;


ALTER FUNCTION "public"."update_product_rating"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_review_likes_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Если лайк добавили, прибавляем 1 к текущему значению
    UPDATE public.product_reviews
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.review_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Если лайк убрали, отнимаем 1, но не даем уйти в минус
    UPDATE public.product_reviews
    SET helpful_count = GREATEST(helpful_count - 1, 0)
    WHERE id = OLD.review_id;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_review_likes_count"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor_id" "uuid",
    "actor_username" "text",
    "action" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "text",
    "before" "jsonb",
    "after" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."order_status" DEFAULT 'pending'::"public"."order_status" NOT NULL,
    "total_amount" numeric(10,2) NOT NULL,
    "shipping_address" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "payment_status" "public"."payment_status" DEFAULT 'awaiting_payment'::"public"."payment_status" NOT NULL,
    "delivery_method_id" "uuid" NOT NULL,
    "delivery_cost" numeric(10,2) DEFAULT 0 NOT NULL,
    "payment_fee" numeric(10,2) DEFAULT 0 NOT NULL,
    "payment_method_id" "uuid" NOT NULL,
    "order_number" character varying(15),
    "delivery_status" "public"."delivery_status" DEFAULT 'awaiting_dispatch'::"public"."delivery_status" NOT NULL,
    "stock_restored" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "avatar_url" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "role" "public"."user_role" DEFAULT 'user'::"public"."user_role" NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."admin_customers_view" WITH ("security_invoker"='off') AS
 SELECT "p"."id",
    "p"."username",
    "p"."first_name",
    "p"."last_name",
    "p"."avatar_url",
    "p"."role",
    "u"."email",
    "u"."created_at" AS "registered_at",
    COALESCE("o"."orders_count", (0)::bigint) AS "orders_count",
    COALESCE("o"."total_spent", (0)::numeric) AS "total_spent",
    "o"."last_order_at"
   FROM (("public"."profiles" "p"
     JOIN "auth"."users" "u" ON (("u"."id" = "p"."id")))
     LEFT JOIN LATERAL ( SELECT "count"(*) AS "orders_count",
            "sum"("orders"."total_amount") FILTER (WHERE ("orders"."payment_status" = 'paid'::"public"."payment_status")) AS "total_spent",
            "max"("orders"."created_at") AS "last_order_at"
           FROM "public"."orders"
          WHERE ("orders"."user_id" = "p"."id")) "o" ON (true))
  WHERE ( SELECT "public"."is_admin"() AS "is_admin");


ALTER VIEW "public"."admin_customers_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "size_id" bigint NOT NULL,
    CONSTRAINT "cart_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


ALTER TABLE "public"."categories" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."categories_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."delivery_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "price" numeric(10,2) DEFAULT 0 NOT NULL,
    "estimated_time" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "free_from_price" numeric(10,2),
    "code" "public"."delivery_method_type" NOT NULL
);


ALTER TABLE "public"."delivery_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."delivery_status_transitions" (
    "from_status" "public"."delivery_status" NOT NULL,
    "to_status" "public"."delivery_status" NOT NULL
);


ALTER TABLE "public"."delivery_status_transitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "category" "public"."notification_category" NOT NULL,
    "level" "public"."notification_level" DEFAULT 'info'::"public"."notification_level" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "action_path" "text",
    "entity_id" "text",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" bigint NOT NULL,
    "quantity" integer NOT NULL,
    "price_at_purchase" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "size_id" bigint NOT NULL,
    CONSTRAINT "order_items_price_at_purchase_nonneg" CHECK (("price_at_purchase" >= (0)::numeric)),
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."order_number_seq"
    START WITH 10001
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."order_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "public"."payment_method_type" NOT NULL,
    "name" "text" NOT NULL,
    "fee_percentage" numeric(5,2) DEFAULT 0 NOT NULL,
    "fee_fixed" numeric(10,2) DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payment_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_status_transitions" (
    "from_status" "public"."payment_status" NOT NULL,
    "to_status" "public"."payment_status" NOT NULL
);


ALTER TABLE "public"."payment_status_transitions" OWNER TO "postgres";


ALTER TABLE "public"."product_reviews" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."product_reviews_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."product_sizes" (
    "id" bigint NOT NULL,
    "product_id" bigint,
    "value" "text" NOT NULL,
    "stock" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "product_sizes_stock_nonneg" CHECK (("stock" >= 0))
);


ALTER TABLE "public"."product_sizes" OWNER TO "postgres";


ALTER TABLE "public"."product_sizes" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."product_sizes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" bigint NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "discount_percentage" numeric(5,2) DEFAULT 0,
    "rating" numeric(3,2) DEFAULT 0,
    "thumbnail" "text",
    "category_id" bigint,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "brand" "text",
    "sku" "text",
    "weight" numeric(10,2),
    "dimensions" "jsonb" DEFAULT '{"depth": 0, "width": 0, "height": 0}'::"jsonb",
    "warranty_information" "text",
    "shipping_information" "text",
    "availability_status" "text",
    "return_policy" "text",
    "minimum_order_quantity" integer DEFAULT 1,
    "meta" "jsonb" DEFAULT '{"qrCode": "", "barcode": "", "createdAt": "", "updatedAt": ""}'::"jsonb",
    "images" "text"[] DEFAULT '{}'::"text"[],
    "base_price" numeric(10,2) NOT NULL,
    "reviews_count" integer DEFAULT 0 NOT NULL,
    "price" numeric GENERATED ALWAYS AS ("round"(("base_price" * (1.0 - (COALESCE("discount_percentage", 0.0) / 100.0))), 2)) STORED,
    "is_archived" boolean DEFAULT false NOT NULL,
    CONSTRAINT "products_base_price_nonneg" CHECK (("base_price" >= (0)::numeric))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


ALTER TABLE "public"."products" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."products_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE OR REPLACE VIEW "public"."products_view" WITH ("security_invoker"='on') AS
 SELECT "p"."id",
    "p"."title",
    "p"."description",
    "c"."name" AS "category",
    "p"."base_price" AS "basePrice",
    "p"."price",
    "p"."discount_percentage" AS "discountPercentage",
    "p"."rating",
    "p"."tags",
    "p"."brand",
    "p"."sku",
    "p"."weight",
    "p"."dimensions",
    "p"."warranty_information" AS "warrantyInformation",
    "p"."shipping_information" AS "shippingInformation",
    "p"."availability_status" AS "availabilityStatus",
    "p"."return_policy" AS "returnPolicy",
    "p"."reviews_count" AS "reviewsCount",
    "p"."minimum_order_quantity" AS "minimumOrderQuantity",
    "jsonb_build_object"('createdAt', "p"."created_at", 'updatedAt', ("p"."meta" ->> 'updatedAt'::"text"), 'barcode', ("p"."meta" ->> 'barcode'::"text"), 'qrCode', ("p"."meta" ->> 'qrCode'::"text")) AS "meta",
    "p"."thumbnail",
    "p"."images"
   FROM ("public"."products" "p"
     LEFT JOIN "public"."categories" "c" ON (("p"."category_id" = "c"."id")))
  WHERE (NOT "p"."is_archived");


ALTER VIEW "public"."products_view" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_profiles" WITH ("security_invoker"='off') AS
 SELECT "id",
    "username",
    "avatar_url"
   FROM "public"."profiles";


ALTER VIEW "public"."public_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."review_likes" (
    "id" bigint NOT NULL,
    "review_id" bigint NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."review_likes" OWNER TO "postgres";


ALTER TABLE "public"."review_likes" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."review_likes_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."wishlist_items" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "price_at_add" numeric(10,2)
);


ALTER TABLE "public"."wishlist_items" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_id_size_id_key" UNIQUE ("user_id", "size_id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_size_unique" UNIQUE ("user_id", "size_id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."delivery_methods"
    ADD CONSTRAINT "delivery_methods_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."delivery_methods"
    ADD CONSTRAINT "delivery_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."delivery_status_transitions"
    ADD CONSTRAINT "delivery_status_transitions_pkey" PRIMARY KEY ("from_status", "to_status");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_status_transitions"
    ADD CONSTRAINT "payment_status_transitions_pkey" PRIMARY KEY ("from_status", "to_status");



ALTER TABLE ONLY "public"."product_reviews"
    ADD CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_reviews"
    ADD CONSTRAINT "product_reviews_user_product_unique" UNIQUE ("product_id", "user_id");



ALTER TABLE ONLY "public"."product_sizes"
    ADD CONSTRAINT "product_sizes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_sizes"
    ADD CONSTRAINT "product_sizes_product_value_unique" UNIQUE ("product_id", "value");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_reviews"
    ADD CONSTRAINT "unique_user_product_review" UNIQUE ("product_id", "user_id");



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "unique_user_review_like" UNIQUE ("review_id", "user_id");



ALTER TABLE ONLY "public"."wishlist_items"
    ADD CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wishlist_items"
    ADD CONSTRAINT "wishlist_items_user_id_product_id_key" UNIQUE ("user_id", "product_id");



CREATE INDEX "idx_admin_audit_log_created" ON "public"."admin_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_cart_items_user" ON "public"."cart_items" USING "btree" ("user_id");



CREATE INDEX "idx_order_items_order" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_orders_user_created" ON "public"."orders" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "idx_product_reviews_product_date" ON "public"."product_reviews" USING "btree" ("product_id", "date" DESC);



CREATE INDEX "idx_product_reviews_product_helpful" ON "public"."product_reviews" USING "btree" ("product_id", "helpful_count" DESC);



CREATE INDEX "idx_product_reviews_product_rating" ON "public"."product_reviews" USING "btree" ("product_id", "rating");



CREATE INDEX "idx_product_sizes_product" ON "public"."product_sizes" USING "btree" ("product_id");



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category_id");



CREATE INDEX "notifications_user_created_idx" ON "public"."notifications" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "notifications_user_unread_idx" ON "public"."notifications" USING "btree" ("user_id") WHERE (NOT "is_read");



CREATE OR REPLACE TRIGGER "notify_on_order_change" AFTER UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."handle_order_notifications"();



CREATE OR REPLACE TRIGGER "notify_on_price_drop" AFTER UPDATE ON "public"."products" FOR EACH ROW WHEN (("new"."price" < "old"."price")) EXECUTE FUNCTION "public"."handle_wishlist_price_drop"();



CREATE OR REPLACE TRIGGER "on_like_change" AFTER INSERT OR DELETE ON "public"."review_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_review_likes_count"();



CREATE OR REPLACE TRIGGER "on_review_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."product_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_product_rating"();



CREATE OR REPLACE TRIGGER "set_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_order_main_status_trigger" BEFORE UPDATE OF "payment_status", "delivery_status" ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."sync_order_main_status"();



ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "public"."product_sizes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "public"."product_sizes"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_delivery_method_id_fkey" FOREIGN KEY ("delivery_method_id") REFERENCES "public"."delivery_methods"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_reviews"
    ADD CONSTRAINT "product_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_reviews"
    ADD CONSTRAINT "product_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_sizes"
    ADD CONSTRAINT "product_sizes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."product_reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_likes"
    ADD CONSTRAINT "review_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wishlist_items"
    ADD CONSTRAINT "wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wishlist_items"
    ADD CONSTRAINT "wishlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can view all order items" ON "public"."order_items" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can view all orders" ON "public"."orders" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can view all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can view delivery status transitions" ON "public"."delivery_status_transitions" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can view payment status transitions" ON "public"."payment_status_transitions" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can view the audit log" ON "public"."admin_audit_log" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Allow everyone to read payment methods" ON "public"."payment_methods" FOR SELECT USING (true);



CREATE POLICY "Allow read for all" ON "public"."product_sizes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view delivery methods" ON "public"."delivery_methods" FOR SELECT USING (true);



CREATE POLICY "Anyone can view likes" ON "public"."review_likes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view reviews" ON "public"."product_reviews" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Users can delete own likes" ON "public"."review_likes" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own reviews" ON "public"."product_reviews" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own cart items" ON "public"."cart_items" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own notifications" ON "public"."notifications" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete their own wishlist" ON "public"."wishlist_items" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own likes" ON "public"."review_likes" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own cart items" ON "public"."cart_items" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert their own wishlist" ON "public"."wishlist_items" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update their own cart items" ON "public"."cart_items" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own cart items" ON "public"."cart_items" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own order items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Users can view their own orders" ON "public"."orders" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can view their own wishlist" ON "public"."wishlist_items" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."admin_audit_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "allow read for all" ON "public"."products" FOR SELECT USING (true);



ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."delivery_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."delivery_status_transitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_status_transitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_sizes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."review_likes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wishlist_items" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."product_reviews" TO "anon";
GRANT ALL ON TABLE "public"."product_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."product_reviews" TO "service_role";



REVOKE ALL ON FUNCTION "public"."add_or_update_review"("p_product_id" bigint, "p_rating" integer, "p_comment" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_or_update_review"("p_product_id" bigint, "p_rating" integer, "p_comment" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_or_update_review"("p_product_id" bigint, "p_rating" integer, "p_comment" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_or_update_review"("p_product_id" bigint, "p_rating" integer, "p_comment" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_archive_product"("p_id" bigint, "p_archived" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_archive_product"("p_id" bigint, "p_archived" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_archive_product"("p_id" bigint, "p_archived" boolean) TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_create_product"("p_payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_create_product"("p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_product"("p_payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_dashboard_stats"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_dashboard_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_dashboard_stats"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_delete_category"("p_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_delete_category"("p_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_category"("p_id" bigint) TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_delete_product_size"("p_size_id" bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_delete_product_size"("p_size_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_product_size"("p_size_id" bigint) TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_set_stock"("p_size_id" bigint, "p_stock" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_set_stock"("p_size_id" bigint, "p_stock" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_stock"("p_size_id" bigint, "p_stock" integer) TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_set_user_role"("p_user_id" "uuid", "p_role" "public"."user_role") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_set_user_role"("p_user_id" "uuid", "p_role" "public"."user_role") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_set_user_role"("p_user_id" "uuid", "p_role" "public"."user_role") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_update_order_status"("p_order_id" "uuid", "p_payment_status" "public"."payment_status", "p_delivery_status" "public"."delivery_status") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_update_order_status"("p_order_id" "uuid", "p_payment_status" "public"."payment_status", "p_delivery_status" "public"."delivery_status") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_order_status"("p_order_id" "uuid", "p_payment_status" "public"."payment_status", "p_delivery_status" "public"."delivery_status") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_update_product"("p_id" bigint, "p_payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_update_product"("p_id" bigint, "p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_product"("p_id" bigint, "p_payload" "jsonb") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_upsert_category"("p_id" bigint, "p_name" "text", "p_slug" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_upsert_category"("p_id" bigint, "p_name" "text", "p_slug" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_upsert_category"("p_id" bigint, "p_name" "text", "p_slug" "text") TO "service_role";



REVOKE ALL ON FUNCTION "public"."admin_upsert_product_size"("p_product_id" bigint, "p_value" "text", "p_stock" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_upsert_product_size"("p_product_id" bigint, "p_value" "text", "p_stock" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_upsert_product_size"("p_product_id" bigint, "p_value" "text", "p_stock" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_order"("p_items" "jsonb", "p_delivery_method_id" "uuid", "p_payment_method_id" "uuid", "p_shipping_address" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_order"("p_items" "jsonb", "p_delivery_method_id" "uuid", "p_payment_method_id" "uuid", "p_shipping_address" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_order"("p_items" "jsonb", "p_delivery_method_id" "uuid", "p_payment_method_id" "uuid", "p_shipping_address" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_last_purchase_date"("p_product_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_last_purchase_date"("p_product_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_last_purchase_date"("p_product_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_review_stats"("p_product_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_review_stats"("p_product_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_review_stats"("p_product_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_unreviewed_purchases"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_unreviewed_purchases"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_unreviewed_purchases"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_order_notifications"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_order_notifications"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_order_notifications"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_wishlist_price_drop"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_wishlist_price_drop"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_wishlist_price_drop"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_admin"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



REVOKE ALL ON FUNCTION "public"."is_terminal_order_status"("p_status" "public"."order_status") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_terminal_order_status"("p_status" "public"."order_status") TO "anon";
GRANT ALL ON FUNCTION "public"."is_terminal_order_status"("p_status" "public"."order_status") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_terminal_order_status"("p_status" "public"."order_status") TO "service_role";



REVOKE ALL ON FUNCTION "public"."log_admin_action"("p_action" "text", "p_entity_type" "text", "p_entity_id" "text", "p_before" "jsonb", "p_after" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."log_admin_action"("p_action" "text", "p_entity_type" "text", "p_entity_id" "text", "p_before" "jsonb", "p_after" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_admin_action"("p_action" "text", "p_entity_type" "text", "p_entity_id" "text", "p_before" "jsonb", "p_after" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_order_main_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_order_main_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_order_main_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_review_like"("p_review_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_review_like"("p_review_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_review_like"("p_review_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_product_rating"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_product_rating"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_product_rating"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_review_likes_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_review_likes_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_review_likes_count"() TO "service_role";



GRANT ALL ON TABLE "public"."admin_audit_log" TO "service_role";
GRANT SELECT ON TABLE "public"."admin_audit_log" TO "authenticated";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT UPDATE("username") ON TABLE "public"."profiles" TO "anon";
GRANT UPDATE("username") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("first_name") ON TABLE "public"."profiles" TO "anon";
GRANT UPDATE("first_name") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("last_name") ON TABLE "public"."profiles" TO "anon";
GRANT UPDATE("last_name") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("avatar_url") ON TABLE "public"."profiles" TO "anon";
GRANT UPDATE("avatar_url") ON TABLE "public"."profiles" TO "authenticated";



GRANT UPDATE("updated_at") ON TABLE "public"."profiles" TO "anon";
GRANT UPDATE("updated_at") ON TABLE "public"."profiles" TO "authenticated";



GRANT ALL ON TABLE "public"."admin_customers_view" TO "service_role";
GRANT SELECT ON TABLE "public"."admin_customers_view" TO "authenticated";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."delivery_methods" TO "anon";
GRANT ALL ON TABLE "public"."delivery_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."delivery_methods" TO "service_role";



GRANT ALL ON TABLE "public"."delivery_status_transitions" TO "service_role";
GRANT SELECT ON TABLE "public"."delivery_status_transitions" TO "authenticated";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."payment_methods" TO "anon";
GRANT ALL ON TABLE "public"."payment_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_methods" TO "service_role";



GRANT ALL ON TABLE "public"."payment_status_transitions" TO "service_role";
GRANT SELECT ON TABLE "public"."payment_status_transitions" TO "authenticated";



GRANT ALL ON SEQUENCE "public"."product_reviews_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_reviews_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_reviews_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."product_sizes" TO "anon";
GRANT ALL ON TABLE "public"."product_sizes" TO "authenticated";
GRANT ALL ON TABLE "public"."product_sizes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."product_sizes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."product_sizes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."product_sizes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."products_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."products_view" TO "service_role";
GRANT SELECT ON TABLE "public"."products_view" TO "anon";
GRANT SELECT ON TABLE "public"."products_view" TO "authenticated";



GRANT SELECT,MAINTAIN ON TABLE "public"."public_profiles" TO "anon";
GRANT SELECT,MAINTAIN ON TABLE "public"."public_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."public_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."review_likes" TO "anon";
GRANT ALL ON TABLE "public"."review_likes" TO "authenticated";
GRANT ALL ON TABLE "public"."review_likes" TO "service_role";



GRANT ALL ON SEQUENCE "public"."review_likes_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."review_likes_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."review_likes_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."wishlist_items" TO "anon";
GRANT ALL ON TABLE "public"."wishlist_items" TO "authenticated";
GRANT ALL ON TABLE "public"."wishlist_items" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







