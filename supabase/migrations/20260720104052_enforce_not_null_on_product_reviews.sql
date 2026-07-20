-- Broken rows (predate add_or_update_review, the only write path today) are
-- not recoverable: a review without product_id/rating is meaningless.
delete from public.product_reviews
 where product_id is null
    or rating     is null
    or date       is null;

alter table public.product_reviews
  alter column product_id set not null,
  alter column rating     set not null,
  alter column date       set not null;
