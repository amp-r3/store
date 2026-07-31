-- Admin panel stage 4: review moderation. Reading every review already
-- works without any change -- "Anyone can view reviews" is `using (true)`
-- (20260723071805 dropped the write policies, not the read one) -- so the
-- only gap is a delete path: product_reviews' own DELETE policy is
-- author-scoped (`auth.uid() = user_id`), which can't reach another user's
-- review or the guest/template rows seeded with a null user_id.
create or replace function "public"."admin_delete_review"("p_review_id" bigint)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_before jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select to_jsonb(r) into v_before from public.product_reviews r where r.id = p_review_id;
    if v_before is null then
        raise exception 'Review not found';
    end if;

    -- on_review_change (AFTER DELETE) recomputes products.rating/reviews_count
    -- itself -- nothing else to do here.
    delete from public.product_reviews where id = p_review_id;

    perform public.log_admin_action('review.delete', 'product_review', p_review_id::text, v_before, null);
end;
$$;

alter function "public"."admin_delete_review"(bigint) owner to "postgres";
revoke all on function "public"."admin_delete_review"(bigint) from public;
grant execute on function "public"."admin_delete_review"(bigint) to "authenticated", "service_role";
revoke execute on function "public"."admin_delete_review"(bigint) from "anon";
