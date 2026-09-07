-- ============================================================================
-- 0028_ratings_review_text.sql
--
-- Step 3 of the host-profile-card redesign: adds an optional free-text
-- review alongside the existing numeric rating. Reuses the existing
-- `ratings` table (migration 0011) rather than a new one — a review is just
-- an optional extra field on the same one-row-per-(rater,ratee) rating a
-- cleaner already leaves for a host. Only rows with ratee_role = 'customer'
-- and a non-null review_text ever surface as "Reviews from cleaners" on
-- app/(cleaner)/cleaner/customers/[id]/page.tsx.
--
-- No changes needed to the existing rating_avg/rating_count trigger — it
-- already ignores this column.
--
-- Apply by hand in the Supabase SQL Editor.
-- ============================================================================

alter table public.ratings add column if not exists review_text text;

NOTIFY pgrst, 'reload schema';
