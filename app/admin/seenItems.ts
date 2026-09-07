import { createAdminClient } from '@/lib/supabase/admin'

// Shared "seen/unseen" tracking (migration 0024_admin_seen_items.sql) — a
// single flag per item, not per-admin, since multiple admins share one
// worklist. Absence of a row means unseen; there's no need to pre-create
// rows for every item up front.
export type SeenEntityType = 'cleaner_application' | 'customer_application' | 'booking' | 'support_message'

export async function fetchSeenMap(entityType: SeenEntityType, ids: string[]): Promise<Map<string, boolean>> {
  if (ids.length === 0) return new Map()
  const admin = createAdminClient()
  const { data } = await admin
    .from('admin_seen_items')
    .select('entity_id, seen')
    .eq('entity_type', entityType)
    .in('entity_id', ids)
  return new Map((data ?? []).map(r => [r.entity_id, r.seen]))
}

// Count of ids with no seen=true row — used for sidebar "new" badges. Fails
// open (returns 0, never blocks the page) if the table isn't reachable yet
// (migration not run / stale schema cache), same fail-open policy already
// used for the customer-approval column.
export async function countUnseen(entityType: SeenEntityType, ids: string[]): Promise<number> {
  if (ids.length === 0) return 0
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('admin_seen_items')
    .select('entity_id')
    .eq('entity_type', entityType)
    .eq('seen', true)
    .in('entity_id', ids)
  if (error) return 0
  const seenIds = new Set((data ?? []).map(r => r.entity_id))
  return ids.filter(id => !seenIds.has(id)).length
}
