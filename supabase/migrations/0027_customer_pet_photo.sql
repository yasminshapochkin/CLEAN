-- ============================================================================
-- 0027_customer_pet_photo.sql
--
-- Step 2 of the host-profile-card redesign: adds customers.pet_photo_url so a
-- host can upload a photo of their pet(s), shown on
-- app/(cleaner)/cleaner/customers/[id]/page.tsx's Pets section (previously a
-- static "Photo coming soon" placeholder). Uploaded via the existing public
-- `avatars` storage bucket (see 0000c_storage.sql) at path
-- {user_id}/pet.{ext} — reuses the same bucket/RLS policy as the profile
-- avatar, just a different filename within the user's own folder, so no new
-- storage policy is needed.
--
-- Apply by hand in the Supabase SQL Editor.
-- ============================================================================

alter table public.customers add column if not exists pet_photo_url text;

NOTIFY pgrst, 'reload schema';
