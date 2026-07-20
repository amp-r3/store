-- 1. Merge data: card_online row -> online_card.
do $$
declare
  v_legacy_id  uuid;
  v_target_id  uuid;
begin
  select id into v_legacy_id from public.payment_methods where code = 'card_online';
  if v_legacy_id is null then
    return; -- no legacy row, nothing to merge
  end if;

  select id into v_target_id from public.payment_methods where code = 'online_card';

  if v_target_id is null then
    -- no canonical row yet: just rename the code
    update public.payment_methods set code = 'online_card' where id = v_legacy_id;
  else
    -- both rows exist: repoint orders to the canonical row and drop the duplicate
    update public.orders
       set payment_method_id = v_target_id
     where payment_method_id = v_legacy_id;
    delete from public.payment_methods where id = v_legacy_id;
  end if;
end $$;

-- 2. Recreate the enum without card_online.
--    Used only by payment_methods.code; no function takes/returns payment_method_type.
alter type public.payment_method_type rename to payment_method_type_old;

create type public.payment_method_type as enum (
  'cash_on_delivery',
  'online_card',
  'paypal',
  'sepa',
  'klarna'
);

alter table public.payment_methods
  alter column code type public.payment_method_type
  using code::text::public.payment_method_type;

drop type public.payment_method_type_old;
