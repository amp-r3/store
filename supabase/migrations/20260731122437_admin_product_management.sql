-- Admin panel stage 2: products, categories, and per-size stock.
--
-- products cannot be hard-deleted: order_items.product_id is `on delete
-- restrict`, so any product that was ever ordered can't be removed without
-- breaking order history. Soft-delete via is_archived + filtering it out of
-- products_view is the only option that doesn't touch that FK.
alter table "public"."products"
    add column "is_archived" boolean not null default false;

-- Same shape as before, plus `where not p.is_archived`. security_invoker
-- stays 'on' -- the view still only ever shows what the caller's own RLS
-- (products: "allow read for all") would let them see; archiving is a
-- catalog-visibility filter, not a security boundary.
create or replace view "public"."products_view" with ("security_invoker"='on') as
 select "p"."id",
    "p"."title",
    "p"."description",
    "c"."name" as "category",
    "p"."base_price" as "basePrice",
    "p"."price",
    "p"."discount_percentage" as "discountPercentage",
    "p"."rating",
    "p"."tags",
    "p"."brand",
    "p"."sku",
    "p"."weight",
    "p"."dimensions",
    "p"."warranty_information" as "warrantyInformation",
    "p"."shipping_information" as "shippingInformation",
    "p"."availability_status" as "availabilityStatus",
    "p"."return_policy" as "returnPolicy",
    "p"."reviews_count" as "reviewsCount",
    "p"."minimum_order_quantity" as "minimumOrderQuantity",
    jsonb_build_object('createdAt', "p"."created_at", 'updatedAt', ("p"."meta" ->> 'updatedAt'), 'barcode', ("p"."meta" ->> 'barcode'), 'qrCode', ("p"."meta" ->> 'qrCode')) as "meta",
    "p"."thumbnail",
    "p"."images"
   from ("public"."products" "p"
     left join "public"."categories" "c" on (("p"."category_id" = "c"."id")))
   where not "p"."is_archived";

alter view "public"."products_view" owner to "postgres";
revoke all on table "public"."products_view" from "anon", "authenticated";
grant select on table "public"."products_view" to "anon", "authenticated", "service_role";
grant all on table "public"."products_view" to "service_role";

-- Admin reads the raw table for the products page (sees archived rows too);
-- "allow read for all" on products already covers that, no new policy needed.

-- ── admin_create_product / admin_update_product take a jsonb payload rather
--    than ~18 positional arguments -- unreadable at the call site and it
--    breaks every time a column is added. Only an explicit whitelist of keys
--    is read back out, so a client can't smuggle in `id`, `price` (generated,
--    would error anyway) or `reviews_count`/`rating` (owned by the review
--    triggers) through the payload.
create or replace function "public"."admin_create_product"("p_payload" jsonb)
returns bigint
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_id bigint;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    insert into public.products (
        title, description, category_id, base_price, discount_percentage,
        thumbnail, images, tags, brand, sku, weight, dimensions,
        warranty_information, shipping_information, availability_status,
        return_policy, minimum_order_quantity, meta
    ) values (
        p_payload->>'title',
        p_payload->>'description',
        nullif(p_payload->>'category_id', '')::bigint,
        (p_payload->>'base_price')::numeric,
        coalesce((p_payload->>'discount_percentage')::numeric, 0),
        p_payload->>'thumbnail',
        coalesce((select array_agg(value) from jsonb_array_elements_text(p_payload->'images')), '{}'),
        coalesce((select array_agg(value) from jsonb_array_elements_text(p_payload->'tags')), '{}'),
        p_payload->>'brand',
        p_payload->>'sku',
        nullif(p_payload->>'weight', '')::numeric,
        coalesce(p_payload->'dimensions', '{"depth":0,"width":0,"height":0}'::jsonb),
        p_payload->>'warranty_information',
        p_payload->>'shipping_information',
        p_payload->>'availability_status',
        p_payload->>'return_policy',
        coalesce((p_payload->>'minimum_order_quantity')::integer, 1),
        jsonb_build_object(
            'createdAt', now(),
            'updatedAt', now(),
            'barcode', coalesce(p_payload->'meta'->>'barcode', ''),
            'qrCode', coalesce(p_payload->'meta'->>'qrCode', '')
        )
    )
    returning id into v_id;

    perform public.log_admin_action('product.create', 'product', v_id::text, null, p_payload);

    return v_id;
end;
$$;

alter function "public"."admin_create_product"(jsonb) owner to "postgres";
revoke all on function "public"."admin_create_product"(jsonb) from public;
grant execute on function "public"."admin_create_product"(jsonb) to "authenticated", "service_role";
revoke execute on function "public"."admin_create_product"(jsonb) from "anon";

create or replace function "public"."admin_update_product"("p_id" bigint, "p_payload" jsonb)
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

    select to_jsonb(p) into v_before from public.products p where p.id = p_id;
    if v_before is null then
        raise exception 'Product not found';
    end if;

    update public.products set
        title = coalesce(p_payload->>'title', title),
        description = coalesce(p_payload->>'description', description),
        category_id = case when p_payload ? 'category_id'
            then nullif(p_payload->>'category_id', '')::bigint else category_id end,
        base_price = coalesce((p_payload->>'base_price')::numeric, base_price),
        discount_percentage = coalesce((p_payload->>'discount_percentage')::numeric, discount_percentage),
        thumbnail = coalesce(p_payload->>'thumbnail', thumbnail),
        images = case when p_payload ? 'images'
            then coalesce((select array_agg(value) from jsonb_array_elements_text(p_payload->'images')), '{}')
            else images end,
        tags = case when p_payload ? 'tags'
            then coalesce((select array_agg(value) from jsonb_array_elements_text(p_payload->'tags')), '{}')
            else tags end,
        brand = coalesce(p_payload->>'brand', brand),
        sku = coalesce(p_payload->>'sku', sku),
        weight = case when p_payload ? 'weight'
            then nullif(p_payload->>'weight', '')::numeric else weight end,
        dimensions = coalesce(p_payload->'dimensions', dimensions),
        warranty_information = coalesce(p_payload->>'warranty_information', warranty_information),
        shipping_information = coalesce(p_payload->>'shipping_information', shipping_information),
        availability_status = coalesce(p_payload->>'availability_status', availability_status),
        return_policy = coalesce(p_payload->>'return_policy', return_policy),
        minimum_order_quantity = coalesce((p_payload->>'minimum_order_quantity')::integer, minimum_order_quantity),
        meta = jsonb_build_object(
            'createdAt', meta->>'createdAt',
            'updatedAt', now(),
            'barcode', coalesce(p_payload->'meta'->>'barcode', meta->>'barcode'),
            'qrCode', coalesce(p_payload->'meta'->>'qrCode', meta->>'qrCode')
        )
    where id = p_id;

    perform public.log_admin_action('product.update', 'product', p_id::text, v_before, p_payload);
end;
$$;

alter function "public"."admin_update_product"(bigint, jsonb) owner to "postgres";
revoke all on function "public"."admin_update_product"(bigint, jsonb) from public;
grant execute on function "public"."admin_update_product"(bigint, jsonb) to "authenticated", "service_role";
revoke execute on function "public"."admin_update_product"(bigint, jsonb) from "anon";

create or replace function "public"."admin_archive_product"("p_id" bigint, "p_archived" boolean)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_before boolean;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select is_archived into v_before from public.products where id = p_id;
    if not found then
        raise exception 'Product not found';
    end if;

    update public.products set is_archived = p_archived where id = p_id;

    perform public.log_admin_action(
        'product.archive', 'product', p_id::text,
        jsonb_build_object('is_archived', v_before), jsonb_build_object('is_archived', p_archived)
    );
end;
$$;

alter function "public"."admin_archive_product"(bigint, boolean) owner to "postgres";
revoke all on function "public"."admin_archive_product"(bigint, boolean) from public;
grant execute on function "public"."admin_archive_product"(bigint, boolean) to "authenticated", "service_role";
revoke execute on function "public"."admin_archive_product"(bigint, boolean) from "anon";

-- ── Categories. Delete is safe: products.category_id is `on delete set null`.
create or replace function "public"."admin_upsert_category"("p_id" bigint, "p_name" text, "p_slug" text)
returns bigint
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_id bigint;
    v_before jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    if p_id is null then
        insert into public.categories (name, slug) values (p_name, p_slug) returning id into v_id;
        perform public.log_admin_action('category.create', 'category', v_id::text, null,
            jsonb_build_object('name', p_name, 'slug', p_slug));
    else
        select to_jsonb(c) into v_before from public.categories c where c.id = p_id;
        if v_before is null then
            raise exception 'Category not found';
        end if;

        update public.categories set name = p_name, slug = p_slug where id = p_id;
        v_id := p_id;
        perform public.log_admin_action('category.update', 'category', p_id::text, v_before,
            jsonb_build_object('name', p_name, 'slug', p_slug));
    end if;

    return v_id;
end;
$$;

alter function "public"."admin_upsert_category"(bigint, text, text) owner to "postgres";
revoke all on function "public"."admin_upsert_category"(bigint, text, text) from public;
grant execute on function "public"."admin_upsert_category"(bigint, text, text) to "authenticated", "service_role";
revoke execute on function "public"."admin_upsert_category"(bigint, text, text) from "anon";

create or replace function "public"."admin_delete_category"("p_id" bigint)
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

    select to_jsonb(c) into v_before from public.categories c where c.id = p_id;
    if v_before is null then
        raise exception 'Category not found';
    end if;

    delete from public.categories where id = p_id;

    perform public.log_admin_action('category.delete', 'category', p_id::text, v_before, null);
end;
$$;

alter function "public"."admin_delete_category"(bigint) owner to "postgres";
revoke all on function "public"."admin_delete_category"(bigint) from public;
grant execute on function "public"."admin_delete_category"(bigint) to "authenticated", "service_role";
revoke execute on function "public"."admin_delete_category"(bigint) from "anon";

-- ── Product sizes. (product_id, value) is unique, so upsert is a plain
--    on-conflict rather than needing a separate size id from the client.
create or replace function "public"."admin_upsert_product_size"("p_product_id" bigint, "p_value" text, "p_stock" integer)
returns bigint
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_id bigint;
    v_before jsonb;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    select to_jsonb(ps) into v_before
    from public.product_sizes ps where ps.product_id = p_product_id and ps.value = p_value;

    insert into public.product_sizes (product_id, value, stock)
    values (p_product_id, p_value, p_stock)
    on conflict (product_id, value) do update set stock = excluded.stock
    returning id into v_id;

    perform public.log_admin_action(
        case when v_before is null then 'product_size.create' else 'product_size.update' end,
        'product_size', v_id::text, v_before, jsonb_build_object('product_id', p_product_id, 'value', p_value, 'stock', p_stock)
    );

    return v_id;
end;
$$;

alter function "public"."admin_upsert_product_size"(bigint, text, integer) owner to "postgres";
revoke all on function "public"."admin_upsert_product_size"(bigint, text, integer) from public;
grant execute on function "public"."admin_upsert_product_size"(bigint, text, integer) to "authenticated", "service_role";
revoke execute on function "public"."admin_upsert_product_size"(bigint, text, integer) from "anon";

create or replace function "public"."admin_delete_product_size"("p_size_id" bigint)
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

    select to_jsonb(ps) into v_before from public.product_sizes ps where ps.id = p_size_id;
    if v_before is null then
        raise exception 'Product size not found';
    end if;

    -- order_items.size_id is `on delete restrict` -- a size already sold
    -- against correctly fails here instead of silently corrupting history.
    delete from public.product_sizes where id = p_size_id;

    perform public.log_admin_action('product_size.delete', 'product_size', p_size_id::text, v_before, null);
end;
$$;

alter function "public"."admin_delete_product_size"(bigint) owner to "postgres";
revoke all on function "public"."admin_delete_product_size"(bigint) from public;
grant execute on function "public"."admin_delete_product_size"(bigint) to "authenticated", "service_role";
revoke execute on function "public"."admin_delete_product_size"(bigint) from "anon";

create or replace function "public"."admin_set_stock"("p_size_id" bigint, "p_stock" integer)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
    v_before integer;
begin
    if not public.is_admin() then
        raise exception 'Not authorized';
    end if;

    if p_stock < 0 then
        raise exception 'Stock cannot be negative';
    end if;

    select stock into v_before from public.product_sizes where id = p_size_id;
    if not found then
        raise exception 'Product size not found';
    end if;

    update public.product_sizes set stock = p_stock where id = p_size_id;

    perform public.log_admin_action(
        'product_size.set_stock', 'product_size', p_size_id::text,
        jsonb_build_object('stock', v_before), jsonb_build_object('stock', p_stock)
    );
end;
$$;

alter function "public"."admin_set_stock"(bigint, integer) owner to "postgres";
revoke all on function "public"."admin_set_stock"(bigint, integer) from public;
grant execute on function "public"."admin_set_stock"(bigint, integer) to "authenticated", "service_role";
revoke execute on function "public"."admin_set_stock"(bigint, integer) from "anon";
