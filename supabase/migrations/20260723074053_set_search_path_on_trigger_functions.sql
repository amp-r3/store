-- Neither function is SECURITY DEFINER, so no privilege-escalation risk;
-- both already fully qualify or don't reference tables at all. Pinning
-- search_path closes the remaining function_search_path_mutable warnings
-- for consistency with the rest of the schema. Bodies are unchanged.

CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


CREATE OR REPLACE FUNCTION "public"."sync_order_main_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
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
