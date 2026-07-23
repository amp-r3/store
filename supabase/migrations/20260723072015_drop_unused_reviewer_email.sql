-- reviewer_email was readable under the public SELECT policy on
-- product_reviews and shipped to every client via REVIEW_SELECT's `*`.
-- Existing values are fabricated seed data (@example.com, no user_id) and
-- the column is never rendered in the UI or set by add_or_update_review —
-- it is dead, PII-shaped surface area.
alter table public.product_reviews drop column reviewer_email;
