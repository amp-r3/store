-- Durable notification-center backing store. Rows are written only by
-- SECURITY DEFINER triggers (order status, review reminder, price drop) —
-- no INSERT policy is granted to clients, so this table is read/update-only
-- from the client's perspective.
create type "public"."notification_category" as enum ('order_status', 'review_reminder', 'price_drop', 'system');
create type "public"."notification_level" as enum ('info', 'success', 'warning', 'error');

create table "public"."notifications" (
    "id" uuid default gen_random_uuid() not null,
    "user_id" uuid not null,
    "category" "public"."notification_category" not null,
    "level" "public"."notification_level" default 'info'::"public"."notification_level" not null,
    "title" text not null,
    "body" text,
    "action_path" text,
    "entity_id" text,
    "is_read" boolean default false not null,
    "created_at" timestamp with time zone default now() not null
);

alter table only "public"."notifications"
    add constraint "notifications_pkey" primary key ("id");

alter table only "public"."notifications"
    add constraint "notifications_user_id_fkey" foreign key ("user_id") references auth.users(id) on delete cascade;

create index "notifications_user_created_idx" on "public"."notifications" using btree ("user_id", "created_at" desc);
create index "notifications_user_unread_idx" on "public"."notifications" using btree ("user_id") where (not is_read);

alter table "public"."notifications" enable row level security;

create policy "Users can view their own notifications" on "public"."notifications" for select to "authenticated" using ((( select "auth"."uid"() ) = "user_id"));
create policy "Users can update their own notifications" on "public"."notifications" for update to "authenticated" using ((( select "auth"."uid"() ) = "user_id")) with check ((( select "auth"."uid"() ) = "user_id"));
create policy "Users can delete their own notifications" on "public"."notifications" for delete to "authenticated" using ((( select "auth"."uid"() ) = "user_id"));

alter publication supabase_realtime add table "public"."notifications";
