-- ============================================================================
-- 0026_customer_pet_note.sql
--
-- Adds customers.pet_note (nullable text) — the host onboarding wizard
-- (register/customer/page.tsx) already collects this in its "household"
-- step (a free-text note about the customer's pets, shown only when pets are
-- selected) but the column never existed, so the value was silently dropped
-- on save. This just adds the column so the wizard's existing upsert can
-- persist it; app/(cleaner)/cleaner/customers/[id]/page.tsx now displays it.
--
-- IMPORTANT: pet_note is included unconditionally in the customer wizard's
-- single upsert call (alongside every other field), so until this migration
-- runs, EVERY new customer signup will fail at that upsert (PostgREST
-- rejects the whole request over one unrecognized column). Run this
-- immediately after deploying the app change that adds pet_note to the
-- upsert payload — not "whenever convenient".
--
-- Apply by hand in the Supabase SQL Editor.
-- ============================================================================

alter table public.customers add column if not exists pet_note text;

NOTIFY pgrst, 'reload schema';
