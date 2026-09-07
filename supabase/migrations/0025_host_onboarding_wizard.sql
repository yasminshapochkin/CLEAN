-- ============================================================================
-- 0025_host_onboarding_wizard.sql
--
-- Fields for the new step-by-step host (customer) onboarding wizard
-- (mirrors the cleaner registration wizard's shape). All nullable/defaulted
-- so existing customer rows stay valid untouched.
--
-- first_name/last_name are stored separately from profiles.full_name (which
-- keeps being written as "first last" so every existing reader of full_name
-- is unaffected) — this is groundwork for a future "keep last name private
-- from cleaners where appropriate" display rule, not yet enforced anywhere.
--
-- bedrooms/bathrooms/num_floors are new, separate from the pre-existing
-- num_rooms/floor columns (migration 0006) — num_rooms/floor back the
-- existing /profile "Household details" section and are left untouched;
-- these new columns back the new wizard specifically. dwelling_type's check
-- constraint is widened (not replaced) to also accept 'guesthouse'/'other'
-- alongside the original 'apartment'/'house'.
--
-- Apply by hand in the Supabase SQL Editor.
-- ============================================================================

alter table public.customers add column if not exists first_name text;
alter table public.customers add column if not exists last_name text;
alter table public.customers add column if not exists languages text[] not null default '{}';
alter table public.customers add column if not exists bedrooms integer;
alter table public.customers add column if not exists bathrooms integer;
alter table public.customers add column if not exists num_floors integer;
alter table public.customers add column if not exists usage_frequency text;
alter table public.customers add column if not exists usual_cleaning_type text;
alter table public.customers add column if not exists cleaning_priorities text[] not null default '{}';
alter table public.customers add column if not exists cleaning_priorities_other text;
alter table public.customers add column if not exists home_instructions text;

alter table public.customers drop constraint if exists customers_dwelling_type_check;
alter table public.customers add constraint customers_dwelling_type_check
  check (dwelling_type is null or dwelling_type in ('apartment', 'house', 'guesthouse', 'other'));

alter table public.customers drop constraint if exists customers_usage_frequency_check;
alter table public.customers add constraint customers_usage_frequency_check
  check (usage_frequency is null or usage_frequency in ('weekly', 'twice_monthly', 'occasional', 'one_time'));

alter table public.customers drop constraint if exists customers_usual_cleaning_type_check;
alter table public.customers add constraint customers_usual_cleaning_type_check
  check (usual_cleaning_type is null or usual_cleaning_type in ('regular', 'deep'));

alter table public.customers drop constraint if exists customers_cleaning_priorities_check;
alter table public.customers add constraint customers_cleaning_priorities_check
  check (cleaning_priorities <@ array['kitchen','bathrooms','floors','dusting','windows','linens','laundry','outdoor','other']::text[]);

NOTIFY pgrst, 'reload schema';
