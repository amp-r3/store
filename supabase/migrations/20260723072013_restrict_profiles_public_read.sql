-- profiles was world-readable (USING (true)), exposing every user's
-- first_name/last_name/username/avatar_url to anyone holding the anon key.
-- Restrict the base table to owner-only reads, and expose a narrow public
-- projection (id, username, avatar_url) for cases like review authorship
-- that legitimately need to display another user's identity.
drop policy "Public profiles are viewable by everyone." on public.profiles;

create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

-- Deliberate definer view: the base table is now owner-only, and this is the
-- narrow public projection reviews embed. Supabase's `security_definer_view`
-- lint flags this pattern; here it is the mechanism, not an oversight.
create or replace view public.public_profiles
  with (security_invoker = off) as
  select id, username, avatar_url from public.profiles;

alter view public.public_profiles owner to postgres;
grant select on public.public_profiles to anon, authenticated;
