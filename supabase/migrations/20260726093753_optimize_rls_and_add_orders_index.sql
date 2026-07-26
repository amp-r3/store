-- Every "my orders" query filters by user_id and sorts by created_at desc
-- (see entities/order/api/orderApi.ts), same shape as notifications_user_created_idx,
-- but orders had no index on user_id at all -> full table scan on every order-list fetch.
CREATE INDEX IF NOT EXISTS "idx_orders_user_created" ON "public"."orders" USING "btree" ("user_id", "created_at" DESC);

-- auth.uid() in a RLS policy is re-evaluated per row scanned; wrapping it in
-- (select auth.uid()) lets Postgres cache it as an InitPlan and evaluate it
-- once per statement instead. Same behavior, cheaper on any table with more
-- than a handful of rows. notifications/profiles(select) policies already
-- use this form -- the rest were never migrated to it.

DROP POLICY IF EXISTS "Users can view their own cart items" ON "public"."cart_items";
CREATE POLICY "Users can view their own cart items" ON "public"."cart_items" FOR SELECT USING ((( SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can insert their own cart items" ON "public"."cart_items";
CREATE POLICY "Users can insert their own cart items" ON "public"."cart_items" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can update their own cart items" ON "public"."cart_items";
CREATE POLICY "Users can update their own cart items" ON "public"."cart_items" FOR UPDATE USING ((( SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can delete their own cart items" ON "public"."cart_items";
CREATE POLICY "Users can delete their own cart items" ON "public"."cart_items" FOR DELETE USING ((( SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can view their own wishlist" ON "public"."wishlist_items";
CREATE POLICY "Users can view their own wishlist" ON "public"."wishlist_items" FOR SELECT USING ((( SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can insert their own wishlist" ON "public"."wishlist_items";
CREATE POLICY "Users can insert their own wishlist" ON "public"."wishlist_items" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can delete their own wishlist" ON "public"."wishlist_items";
CREATE POLICY "Users can delete their own wishlist" ON "public"."wishlist_items" FOR DELETE USING ((( SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can view their own orders" ON "public"."orders";
CREATE POLICY "Users can view their own orders" ON "public"."orders" FOR SELECT USING ((( SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can view their own order items" ON "public"."order_items";
CREATE POLICY "Users can view their own order items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders"
  WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = ( SELECT "auth"."uid"()))))));

DROP POLICY IF EXISTS "Users can delete own reviews" ON "public"."product_reviews";
CREATE POLICY "Users can delete own reviews" ON "public"."product_reviews" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can insert own likes" ON "public"."review_likes";
CREATE POLICY "Users can insert own likes" ON "public"."review_likes" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can delete own likes" ON "public"."review_likes";
CREATE POLICY "Users can delete own likes" ON "public"."review_likes" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"()) = "user_id"));

DROP POLICY IF EXISTS "Users can update own profile." ON "public"."profiles";
CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"()) = "id"));
