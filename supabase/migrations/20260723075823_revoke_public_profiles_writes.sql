-- public_profiles was created with `grant select` in
-- 20260723072013_restrict_profiles_public_read.sql, but the schema-wide
-- `ALTER DEFAULT PRIVILEGES ... GRANT ALL ON TABLES TO anon/authenticated`
-- re-grants ALL (including INSERT/UPDATE/DELETE) on every new relation,
-- including views. Since public_profiles is a single-table SELECT with no
-- aggregate/DISTINCT/join, Postgres treats it as auto-updatable, and it runs
-- as security_invoker = off (owner postgres), which bypasses profiles' RLS.
-- Net effect: anon/authenticated could PATCH/DELETE any user's row through
-- this view. Explicitly revoke write privileges here.
--
-- NOTE: any future `create or replace view public_profiles` will silently
-- re-inherit GRANT ALL from the default privileges above and must repeat
-- this revoke.
revoke insert, update, delete, truncate, references, trigger
  on public.public_profiles from anon, authenticated;

grant select on public.public_profiles to anon, authenticated;
