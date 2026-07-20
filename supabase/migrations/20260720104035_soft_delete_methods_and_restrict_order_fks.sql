-- 1. Soft delete: is_active strictly NOT NULL on both method tables.
update public.delivery_methods set is_active = true where is_active is null;

alter table public.delivery_methods
  alter column is_active set default true,
  alter column is_active set not null;

-- payment_methods.is_active is already NOT NULL DEFAULT true; applied idempotently.
alter table public.payment_methods
  alter column is_active set default true,
  alter column is_active set not null;

-- 2. Orders must always reference a method.
alter table public.orders
  alter column delivery_method_id set not null,
  alter column payment_method_id  set not null;

-- 3. Forbid physically deleting a method referenced by an order.
alter table public.orders
  drop constraint if exists orders_delivery_method_id_fkey;
alter table public.orders
  add  constraint orders_delivery_method_id_fkey
  foreign key (delivery_method_id)
  references public.delivery_methods(id) on delete restrict;

alter table public.orders
  drop constraint if exists orders_payment_method_id_fkey;
alter table public.orders
  add  constraint orders_payment_method_id_fkey
  foreign key (payment_method_id)
  references public.payment_methods(id) on delete restrict;
