-- Admin panel stage 3: a customer list with per-user order history/spend,
-- and role management.
--
-- A view rather than an RPC, same reasoning as public_profiles
-- (20260723072013): a view lets the admin customers page paginate/search
-- through PostgREST natively (.range(), .ilike()) instead of reimplementing
-- that inside a jsonb-returning function. security_invoker = off is required
-- to reach auth.users.email (profiles doesn't store it, and RLS on
-- auth.users isn't ours to grant into) and to bypass profiles' own
-- owner-only SELECT policy for the admin case; the `where is_admin()` at the
-- end is what gates it instead of RLS -- a non-admin selecting from this view
-- gets zero rows, not an error.
create or replace view "public"."admin_customers_view" with ("security_invoker"='off') as
select
    p.id,
    p.username,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.role,
    u.email,
    u.created_at as registered_at,
    coalesce(o.orders_count, 0) as orders_count,
    coalesce(o.total_spent, 0) as total_spent,
    o.last_order_at
from public.profiles p
join auth.users u on u.id = p.id
left join lateral (
    select
        count(*) as orders_count,
        sum(total_amount) filter (where payment_status = 'paid') as total_spent,
        max(created_at) as last_order_at
    from public.orders
    where user_id = p.id
) o on true
where (select public.is_admin());

alter view "public"."admin_customers_view" owner to "postgres";

-- Same footgun as public_profiles: ALTER DEFAULT PRIVILEGES auto-grants ALL
-- (incl. INSERT/UPDATE/DELETE) to anon/authenticated on every new relation.
-- This view runs as its owner (security_invoker = off) and would otherwise
-- let any authenticated user write through it. Revoke everything, then grant
-- only SELECT, and only to authenticated -- anon has no admin surface at all.
revoke all on table "public"."admin_customers_view" from "anon", "authenticated";
grant select on table "public"."admin_customers_view" to "authenticated", "service_role";
grant all on table "public"."admin_customers_view" to "service_role";
revoke select on table "public"."admin_customers_view" from "anon";

-- ── Role changes. profiles keeps a column-level revoke on `role` (see
--    20260731071206), so only a security definer function can move it at
--    all; the guards below are business rules the column grant alone can't
--    express (self-demotion, last-admin lockout).
create or replace function "public"."admin_set_user_role"("p_user_id" "uuid", "p_role" "public"."user_role")
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
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

alter function "public"."admin_set_user_role"("uuid", "public"."user_role") owner to "postgres";
revoke all on function "public"."admin_set_user_role"("uuid", "public"."user_role") from public;
grant execute on function "public"."admin_set_user_role"("uuid", "public"."user_role") to "authenticated", "service_role";
revoke execute on function "public"."admin_set_user_role"("uuid", "public"."user_role") from "anon";
