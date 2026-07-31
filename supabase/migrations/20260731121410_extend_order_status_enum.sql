-- Extends order_status with the two terminal outcomes the payment/delivery
-- state machine (next migration) needs to express: a delivered-then-sent-back
-- order and a refunded one. Kept in its own migration/transaction on purpose --
-- a value added to an enum can't be referenced in the same transaction it was
-- added in, so the trigger rewrite that uses these values has to land after
-- this one commits.
alter type "public"."order_status" add value if not exists 'returned';
alter type "public"."order_status" add value if not exists 'refunded';
