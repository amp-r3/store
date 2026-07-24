-- Writes a notifications row whenever an order's status/delivery_status/
-- payment_status changes, and a separate review-reminder row on delivery.
-- Labels mirror src/entities/order/config/order-management.config.tsx so the
-- center reads the same copy as the rest of the app.
create or replace function "public"."handle_order_notifications"() returns "trigger"
    language "plpgsql" security definer
    set "search_path" to 'public', 'pg_temp'
    as $$
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
    end;
    _level := case
      when NEW.status = 'cancelled' then 'error'
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

create or replace trigger "notify_on_order_change" after update on "public"."orders"
  for each row execute function "public"."handle_order_notifications"();
