-- ============================================================================
-- 0024_admin_seen_items.sql
--
-- Generic "seen/unseen" tracking shared across admin list screens
-- (Applications, Booking Requests, Matches, Support) — since there can be
-- multiple admins, this is a single shared flag per item (not per-admin):
-- once any admin checks it off, it's seen for everyone, like a shared todo
-- list. One row per tracked item, created on first toggle (absence = unseen).
-- Apply by hand in the Supabase SQL Editor.
-- ============================================================================

create table if not exists public.admin_seen_items (
  entity_type text not null check (entity_type in ('cleaner_application', 'customer_application', 'booking', 'support_message')),
  entity_id uuid not null,
  seen boolean not null default false,
  seen_by uuid references public.profiles(id),
  seen_at timestamptz,
  primary key (entity_type, entity_id)
);

alter table public.admin_seen_items enable row level security;
-- No policies — only the service-role admin client reads/writes this table,
-- same pattern as blocked_users/support_messages/admin_invites.

NOTIFY pgrst, 'reload schema';
