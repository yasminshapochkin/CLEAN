-- ============================================================================
-- 0030_dwelling_type_office_villa.sql
--
-- Widens customers.dwelling_type's check constraint (migration 0025) to also
-- accept 'office' and 'villa' — the booking request card's "Your home"
-- editor now offers apartment/house/guesthouse/office/villa. 'other' stays
-- in the allowed set for backward compatibility with any existing rows (the
-- host onboarding wizard offered it before this migration; nothing writes it
-- going forward from the booking card's editor, but nothing needs to reject
-- it retroactively either).
--
-- Apply by hand in the Supabase SQL Editor.
-- ============================================================================

alter table public.customers drop constraint if exists customers_dwelling_type_check;
alter table public.customers add constraint customers_dwelling_type_check
  check (dwelling_type is null or dwelling_type in ('apartment', 'house', 'guesthouse', 'office', 'villa', 'other'));

NOTIFY pgrst, 'reload schema';
