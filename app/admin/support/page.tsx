import { createAdminClient } from '@/lib/supabase/admin'
import { fetchSeenMap } from '@/app/admin/seenItems'
import { SupportList, type SupportMessage } from './SupportList'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminSupportPage() {
  noStore()
  const admin = createAdminClient()

  const { data: rows } = await admin
    .from('support_messages')
    .select('id, user_id, user_role, message, resolved, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  const userIds = Array.from(new Set((rows ?? []).map((r) => r.user_id)))
  const [{ data: profileRows }, seenMap] = await Promise.all([
    userIds.length
      ? admin.from('profiles').select('id, full_name, phone').in('id', userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null; phone: string | null }[] }),
    fetchSeenMap('support_message', (rows ?? []).map((r) => r.id)),
  ])

  const profileMap = new Map((profileRows ?? []).map((p) => [p.id, p]))

  const messages: SupportMessage[] = (rows ?? []).map((r) => {
    const profile = profileMap.get(r.user_id)
    return {
      id: r.id,
      userRole: r.user_role,
      name: profile?.full_name ?? '',
      phone: profile?.phone ?? '',
      message: r.message,
      resolved: r.resolved,
      createdAt: r.created_at,
      seen: seenMap.get(r.id) ?? false,
    }
  })

  return (
      <div className="px-6 py-6">
        <SupportList messages={messages} />
      </div>
  )
}
