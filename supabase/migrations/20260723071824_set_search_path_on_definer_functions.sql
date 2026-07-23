-- SECURITY DEFINER functions run as their owner (postgres) but without a
-- pinned search_path they resolve unqualified/session-relative objects
-- using the caller's search_path, which is the standard escalation vector
-- for definer functions (Supabase lint: function_search_path_mutable).
-- Bodies are unchanged; only `SET "search_path" TO ...` is added, matching
-- the pattern already used by add_or_update_review and rls_auto_enable.

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
