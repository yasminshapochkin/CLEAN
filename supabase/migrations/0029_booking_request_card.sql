-- ============================================================================
-- 0029_booking_request_card.sql
--
-- Redesigned editable booking-request card: adds the booking-specific fields
-- that don't already exist on `bookings`. Everything else the new card shows
-- (home type/bedrooms/bathrooms, pet types/count, cleaning-preference
-- default) is read live from the customer's `customers` profile row, not
-- snapshotted here — only what's genuinely specific to *this* booking gets a
-- new column:
--
--   cleaning_type   -- 'regular' | 'deep' for this visit (defaults from
--                       customers.usual_cleaning_type in the UI, but can
--                       differ per booking)
--   extras          -- selected extras for this visit (predefined chips and
--                       free-text custom entries both live in this one array)
--   pets_present    -- whether the pet(s) will be home during this clean
--   host_present    -- whether the host will be home during this clean
--
-- Apply by hand in the Supabase SQL Editor.
-- ============================================================================

alter table public.bookings add column if not exists cleaning_type text;
alter table public.bookings add column if not exists extras text[] not null default '{}';
alter table public.bookings add column if not exists pets_present boolean;
alter table public.bookings add column if not exists host_present boolean;

alter table public.bookings drop constraint if exists bookings_cleaning_type_check;
alter table public.bookings add constraint bookings_cleaning_type_check
  check (cleaning_type is null or cleaning_type in ('regular', 'deep'));

NOTIFY pgrst, 'reload schema';
