-- The "images" bucket already exists and is public (product thumbnails/images
-- are served from it today), but storage.objects has zero RLS policies —
-- public downloads bypass RLS entirely via the bucket's public flag, so
-- reads already work, but writes (admin uploads from the product form) are
-- currently denied outright. This adds the missing policies: read stays
-- open to everyone (matches the bucket's public flag), writes are
-- admin-only via the same public.is_admin() helper every other admin write
-- policy/RPC uses.

CREATE POLICY "Anyone can view product images"
ON "storage"."objects"
FOR SELECT
USING (bucket_id = 'images');

CREATE POLICY "Admins can upload product images"
ON "storage"."objects"
FOR INSERT
TO "authenticated"
WITH CHECK (bucket_id = 'images' AND (SELECT "public"."is_admin"()));

CREATE POLICY "Admins can replace product images"
ON "storage"."objects"
FOR UPDATE
TO "authenticated"
USING (bucket_id = 'images' AND (SELECT "public"."is_admin"()))
WITH CHECK (bucket_id = 'images' AND (SELECT "public"."is_admin"()));

CREATE POLICY "Admins can delete product images"
ON "storage"."objects"
FOR DELETE
TO "authenticated"
USING (bucket_id = 'images' AND (SELECT "public"."is_admin"()));
