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


CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'processing',
    'shipped',
    'completed',
    'cancelled'
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
    "reviewer_name" "text",
    "reviewer_email" "text",
    "is_edited" boolean DEFAULT false NOT NULL,
    CONSTRAINT "product_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."product_reviews" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_or_update_review"("p_product_id" bigint, "p_rating" integer, "p_comment" "text") RETURNS "public"."product_reviews"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_review public.product_reviews;
  v_has_purchased boolean;
  v_comment text;
BEGIN
  -- 1. Проверка авторизации
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 2. Валидация рейтинга
  IF p_rating IS NULL OR p_rating NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'Rating must be between 1 and 5';
  END IF;

  -- 3. Санитизация комментария
  v_comment := NULLIF(trim(p_comment), '');
  IF v_comment IS NOT NULL AND length(v_comment) > 2000 THEN
    RAISE EXCEPTION 'Comment is too long (max 2000 characters)';
  END IF;

  -- 4. Проверка существования товара
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = p_product_id) THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- 5. Проверка факта покупки и статуса заказа 'completed'
  SELECT EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    WHERE o.user_id = v_user_id
      AND oi.product_id = p_product_id
      AND o.status = 'completed'::order_status
  ) INTO v_has_purchased;

  IF NOT v_has_purchased THEN
    RAISE EXCEPTION 'You can only review products from completed orders.';
  END IF;

  -- 6. Добавление или обновление отзыва
  INSERT INTO public.product_reviews (product_id, user_id, rating, comment)
  VALUES (p_product_id, v_user_id, p_rating, v_comment)
  ON CONFLICT (product_id, user_id)
  DO UPDATE SET
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment,
    date = timezone('utc'::text, now()),
    is_edited = true
  RETURNING * INTO v_review;

  RETURN v_review;
END;
$$;


ALTER FUNCTION "public"."add_or_update_review"("p_product_id" bigint, "p_rating" integer, "p_comment" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_order"("p_items" "jsonb", "p_delivery_method_id" "uuid", "p_payment_method_id" "uuid", "p_shipping_address" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


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
    AS $$
BEGIN
  -- 1. Если отмена или ошибка оплаты -> Cancelled
  IF NEW.delivery_status = 'cancelled'::public.delivery_status OR NEW.payment_status = 'failed'::public.payment_status THEN
    NEW.status := 'cancelled'::public.order_status;

  -- 2. Если успешно доставлено -> Completed
  ELSIF NEW.delivery_status = 'delivered'::public.delivery_status THEN
    NEW.status := 'completed'::public.order_status;

  -- 3. Если отправлен или в пути -> Shipped
  -- Исправлено: строго один раз public.delivery_status для обоих элементов
  ELSIF NEW.delivery_status IN ('dispatched'::public.delivery_status, 'in_transit'::public.delivery_status) THEN
    NEW.status := 'shipped'::public.order_status;

  -- 4. Если оплачен и ждет сборки -> Processing
  ELSIF NEW.payment_status = 'paid'::public.payment_status AND NEW.delivery_status = 'awaiting_dispatch'::public.delivery_status THEN
    NEW.status := 'processing'::public.order_status;

  -- 5. Во всех остальных случаях (например, awaiting_payment) -> Pending
  ELSE
    NEW.status := 'pending'::public.order_status;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_order_main_status"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."toggle_review_like"("p_review_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" bigint NOT NULL,
    "quantity" integer NOT NULL,
    "price_at_purchase" numeric(10,2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "size_id" bigint NOT NULL,
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
    "delivery_status" "public"."delivery_status" DEFAULT 'awaiting_dispatch'::"public"."delivery_status" NOT NULL
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


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
    "stock" integer DEFAULT 0 NOT NULL
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
    "price" numeric GENERATED ALWAYS AS ("round"(("base_price" * (1.0 - (COALESCE("discount_percentage", 0.0) / 100.0))), 2)) STORED
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
     LEFT JOIN "public"."categories" "c" ON (("p"."category_id" = "c"."id")));


ALTER VIEW "public"."products_view" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "avatar_url" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


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
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."wishlist_items" OWNER TO "postgres";


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



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id");



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



CREATE INDEX "idx_cart_items_user" ON "public"."cart_items" USING "btree" ("user_id");



CREATE INDEX "idx_order_items_order" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_product_reviews_product_date" ON "public"."product_reviews" USING "btree" ("product_id", "date" DESC);



CREATE INDEX "idx_product_reviews_product_helpful" ON "public"."product_reviews" USING "btree" ("product_id", "helpful_count" DESC);



CREATE INDEX "idx_product_reviews_product_rating" ON "public"."product_reviews" USING "btree" ("product_id", "rating");



CREATE INDEX "idx_product_sizes_product" ON "public"."product_sizes" USING "btree" ("product_id");



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category_id");



CREATE OR REPLACE TRIGGER "on_like_change" AFTER INSERT OR DELETE ON "public"."review_likes" FOR EACH ROW EXECUTE FUNCTION "public"."update_review_likes_count"();



CREATE OR REPLACE TRIGGER "on_review_change" AFTER INSERT OR DELETE OR UPDATE ON "public"."product_reviews" FOR EACH ROW EXECUTE FUNCTION "public"."update_product_rating"();



CREATE OR REPLACE TRIGGER "set_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "update_order_main_status_trigger" BEFORE UPDATE OF "payment_status", "delivery_status" ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."sync_order_main_status"();



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_size_id_fkey" FOREIGN KEY ("size_id") REFERENCES "public"."product_sizes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



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



CREATE POLICY "Allow everyone to read payment methods" ON "public"."payment_methods" FOR SELECT USING (true);



CREATE POLICY "Allow public read" ON "public"."product_reviews" FOR SELECT USING (true);



CREATE POLICY "Allow read for all" ON "public"."product_sizes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view delivery methods" ON "public"."delivery_methods" FOR SELECT USING (true);



CREATE POLICY "Anyone can view likes" ON "public"."review_likes" FOR SELECT USING (true);



CREATE POLICY "Anyone can view reviews" ON "public"."product_reviews" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can create reviews" ON "public"."product_reviews" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable read access for all users" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can delete own likes" ON "public"."review_likes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own reviews" ON "public"."product_reviews" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own cart items" ON "public"."cart_items" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own wishlist" ON "public"."wishlist_items" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own likes" ON "public"."review_likes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own cart items" ON "public"."cart_items" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own order items" ON "public"."order_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their own orders" ON "public"."orders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own wishlist" ON "public"."wishlist_items" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own reviews" ON "public"."product_reviews" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own cart items" ON "public"."cart_items" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own cart items" ON "public"."cart_items" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own order items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own orders" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own wishlist" ON "public"."wishlist_items" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "allow read for all" ON "public"."products" FOR SELECT USING (true);



ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."delivery_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_methods" ENABLE ROW LEVEL SECURITY;


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



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



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



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_number_seq" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payment_methods" TO "anon";
GRANT ALL ON TABLE "public"."payment_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_methods" TO "service_role";



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



GRANT ALL ON TABLE "public"."products_view" TO "anon";
GRANT ALL ON TABLE "public"."products_view" TO "authenticated";
GRANT ALL ON TABLE "public"."products_view" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



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







