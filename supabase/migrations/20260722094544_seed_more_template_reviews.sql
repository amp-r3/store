-- Adds 14 more template (guest) reviews per product (20 total per product
-- after the previous seed), enough to exercise the "Load more" pagination
-- (page size 10) alongside sorting and rating filters. Same NULL-user_id
-- approach as the previous seed migration.
with templates(idx, rating, comment, days_ago, helpful_count, reviewer_name) as (
  values
    (1, 5, 'Fantastic purchase, would recommend to anyone looking for this.', 2, 15, 'Riley Foster'),
    (2, 5, 'Top notch quality, arrived earlier than expected too.', 5, 9, 'Sam Whitaker'),
    (3, 4, 'Very happy with this, a couple of small nitpicks but nothing major.', 8, 6, 'Drew Sinclair'),
    (4, 4, 'Reliable and does the job well, no regrets buying it.', 14, 4, 'Charlie Novak'),
    (5, 4, 'Pretty good overall, matches the description closely.', 18, 7, 'Avery Kingston'),
    (6, 3, 'It is fine, nothing special but does what it says.', 25, 2, 'Quinn Ellery'),
    (7, 3, 'Average experience, might look at other options next time.', 30, 1, 'Harper Doyle'),
    (8, 2, 'Not quite what I expected, quality feels below average.', 40, 3, 'Rowan Blackwood'),
    (9, 2, 'Had some issues out of the box, support was slow to respond.', 45, 0, 'Skyler Marsh'),
    (10, 1, 'Disappointed with this one, would not purchase again.', 55, 4, 'Emerson Wilder'),
    (11, 5, 'Absolutely love it, using it daily without any problems.', 4, 11, 'Peyton Ashford'),
    (12, 5, 'Great build quality and looks even better in person.', 12, 6, 'Blair Sutherland'),
    (13, 4, 'Solid choice for the price, would consider buying more.', 22, 5, 'Reese Calloway'),
    (14, 3, 'Okay for casual use, would not rely on it for anything serious.', 48, 2, 'Marlowe Pierce')
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
