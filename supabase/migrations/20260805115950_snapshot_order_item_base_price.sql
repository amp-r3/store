-- Snapshot the product's pre-discount base_price onto each order item, so
-- "how much did discounts cost us" can be computed from the order's own
-- history instead of drifting every time a product's current base_price
-- changes. price_at_purchase already snapshots the discounted price paid;
-- this adds its undiscounted counterpart.

alter table public.order_items
  add column base_price_at_purchase numeric(10, 2);

-- Backfill from the product's current base_price. greatest() guards against
-- a product's base_price having been lowered below a historical sale price
-- since the order was placed — in that case there's no discount to report,
-- so the snapshot floors at price_at_purchase (0 imputed discount) rather
-- than a fabricated negative one. coalesce() covers order items whose
-- product no longer exists.
update public.order_items oi
set base_price_at_purchase = coalesce(greatest(p.base_price, oi.price_at_purchase), oi.price_at_purchase)
from public.products p
where p.id = oi.product_id
  and oi.base_price_at_purchase is null;

update public.order_items
set base_price_at_purchase = price_at_purchase
where base_price_at_purchase is null;

alter table public.order_items
  alter column base_price_at_purchase set not null,
  add constraint order_items_base_price_at_purchase_check
    check (base_price_at_purchase >= price_at_purchase);

-- create_order: snapshot the product's base_price alongside its discounted
-- price at the moment of purchase.
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
    p.base_price as base_price,
    sum((i ->> 'quantity')::int) as qty
  from jsonb_array_elements(p_items) as i
    join public.product_sizes ps on ps.id = (i ->> 'size_id')::bigint
    join public.products p on p.id = ps.product_id
  group by ps.id, ps.product_id, p.price, p.base_price;

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
    order_id, product_id, size_id, quantity, price_at_purchase, base_price_at_purchase
  )
  select v_order_id, t.product_id, t.size_id, t.qty, t.price, t.base_price
  from tmp_order_items t;

  -- 6. Списание остатков конкретного размера (Stock update)
  update public.product_sizes ps
  set stock = ps.stock - t.qty
  from tmp_order_items t
  where ps.id = t.size_id;

  -- Возврат JSON с ID заказа и его номером
  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number);
end;$$;
