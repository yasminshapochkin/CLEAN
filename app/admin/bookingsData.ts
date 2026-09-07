import { createAdminClient } from '@/lib/supabase/admin'
import type { BookingResult, BookingStatus } from '@/lib/types/booking'

// Shared by /admin/bookings ("Booking Requests" — pending/declined/cancelled)
// and /admin/matches ("Matches" — accepted/completed), which are otherwise
// identical fetch-and-map pipelines that only differ in which statuses they
// pull. Kept here instead of duplicated so cleaner/customer contact fields
// stay in sync between the two lists.
export async function fetchBookingResults(statuses: BookingStatus[]): Promise<BookingResult[]> {
  const admin = createAdminClient()

  const { data: bookingRows } = await admin
    .from('bookings')
    .select('id, cleaner_id, customer_id, service_type, scheduled_date, scheduled_start, duration_hours, address, notes, status, duration_flexible, cleaner_modified')
    .in('status', statuses)
    .order('scheduled_date', { ascending: false })
    .limit(500)

  const allIds = Array.from(new Set([
    ...(bookingRows ?? []).map(b => b.cleaner_id),
    ...(bookingRows ?? []).map(b => b.customer_id),
  ]))

  const [{ data: profileRows }, authData] = await Promise.all([
    allIds.length > 0
      ? admin.from('profiles').select('id, full_name, avatar_url, phone').in('id', allIds)
      : Promise.resolve({ data: [] }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ])

  const profileMap = new Map((profileRows ?? []).map(p => [p.id, p]))
  const emailMap = new Map((authData.data?.users ?? []).map(u => [u.id, u.email ?? '']))

  return (bookingRows ?? []).map(b => {
    const cleanerProfile = profileMap.get(b.cleaner_id)
    const customerProfile = profileMap.get(b.customer_id)
    return {
      id: b.id,
      cleaner_id: b.cleaner_id,
      cleaner_name: cleanerProfile?.full_name ?? 'Cleaner',
      cleaner_avatar_url: cleanerProfile?.avatar_url ?? null,
      cleaner_email: emailMap.get(b.cleaner_id) ?? '',
      cleaner_phone: cleanerProfile?.phone ?? '',
      customer_id: b.customer_id,
      customer_name: customerProfile?.full_name ?? 'Customer',
      customer_avatar_url: customerProfile?.avatar_url ?? null,
      customer_email: emailMap.get(b.customer_id) ?? '',
      customer_phone: customerProfile?.phone ?? '',
      service_type: b.service_type as BookingResult['service_type'],
      scheduled_date: b.scheduled_date,
      scheduled_start: b.scheduled_start.slice(0, 5),
      duration_hours: b.duration_hours,
      duration_flexible: b.duration_flexible ?? false,
      cleaner_modified: b.cleaner_modified ?? false,
      address: b.address,
      notes: b.notes ?? undefined,
      status: b.status as BookingResult['status'],
    }
  })
}
