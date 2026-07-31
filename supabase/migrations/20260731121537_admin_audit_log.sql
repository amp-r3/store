-- Traceability for every admin write path. Created ahead of the order-status
-- state machine rewrite (next migration) because admin_update_order_status
-- calls log_admin_action() -- every future admin RPC does the same.
create table "public"."admin_audit_log" (
    "id" uuid primary key default gen_random_uuid(),
    "actor_id" uuid references "auth"."users"("id") on delete set null,
    -- snapshot, not a join target: the log must stay readable after the
    -- admin's profile is gone (account deletion, role change, etc).
    "actor_username" text,
    "action" text not null,
    "entity_type" text not null,
    "entity_id" text,
    "before" jsonb,
    "after" jsonb,
    "created_at" timestamp with time zone not null default now()
);

create index "idx_admin_audit_log_created" on "public"."admin_audit_log" using "btree" ("created_at" desc);

alter table "public"."admin_audit_log" enable row level security;

-- Read-only from the API: every row is written by log_admin_action() (security
-- definer), never by a client insert, so no insert/update/delete policy exists.
create policy "Admins can view the audit log" on "public"."admin_audit_log"
    for select to "authenticated"
    using ((select public.is_admin()));

revoke all on table "public"."admin_audit_log" from "anon", "authenticated";
grant select on table "public"."admin_audit_log" to "authenticated", "service_role";
grant all on table "public"."admin_audit_log" to "service_role";

-- security definer: called from inside other security definer admin RPCs,
-- which already asserted is_admin() themselves -- this function does not
-- re-check it, it just records who/what/before/after under the definer's
-- privileges (the caller's role has no insert grant on the table above).
create or replace function "public"."log_admin_action"(
    "p_action" text,
    "p_entity_type" text,
    "p_entity_id" text default null,
    "p_before" jsonb default null,
    "p_after" jsonb default null
)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_actor_id uuid := auth.uid();
    v_actor_username text;
begin
    select username into v_actor_username from public.profiles where id = v_actor_id;

    insert into public.admin_audit_log (actor_id, actor_username, action, entity_type, entity_id, before, after)
    values (v_actor_id, v_actor_username, p_action, p_entity_type, p_entity_id, p_before, p_after);
end;
$$;

alter function "public"."log_admin_action"(text, text, text, jsonb, jsonb) owner to "postgres";
revoke all on function "public"."log_admin_action"(text, text, text, jsonb, jsonb) from public;
grant execute on function "public"."log_admin_action"(text, text, text, jsonb, jsonb) to "authenticated", "service_role";
revoke execute on function "public"."log_admin_action"(text, text, text, jsonb, jsonb) from "anon";
