-- Adds 6 template (guest) reviews to every product, so the review sort,
-- rating filter and pagination UI have realistic data to demo against.
-- user_id is left NULL (Postgres treats NULLs as distinct under the
-- (product_id, user_id) unique constraint, so this doesn't collide with
-- real users' own reviews on the same product); rating/date/helpful_count
-- vary per template so all three sort options and the rating filter show
-- something different.
with templates(idx, rating, comment, days_ago, helpful_count, reviewer_name) as (
  values
    (1, 5, 'Great quality, exactly as described. Would buy again without hesitation.', 3, 12, 'Alex Morgan'),
    (2, 5, 'Exceeded my expectations, shipping was fast and packaging was solid.', 10, 8, 'Jamie Chen'),
    (3, 4, 'Solid product overall, minor wear after a few weeks but still holding up.', 20, 5, 'Taylor Brooks'),
    (4, 4, 'Good value for the price, does what it promises.', 35, 3, 'Jordan Reyes'),
    (5, 3, 'Decent, but I expected a bit more given the price point.', 50, 1, 'Morgan Lee'),
    (6, 5, 'Works great, no complaints so far after regular use.', 60, 0, 'Casey Whitfield')
)
insert into public.product_reviews
  (product_id, rating, comment, "date", user_id, helpful_count, reviewer_name, reviewer_email, is_edited)
select
  p.id,
  t.rating,
  t.comment,
  now() - (t.days_ago || ' days')::interval,
  null,
  t.helpful_count,
  t.reviewer_name,
  null,
  false
from public.products p
cross join templates t;
