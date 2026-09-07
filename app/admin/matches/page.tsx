import { fetchBookingResults } from '@/app/admin/bookingsData'
import { MatchesList } from './MatchesList'
import { unstable_noStore as noStore } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminMatchesPage() {
  noStore()
  const matches = await fetchBookingResults(['accepted', 'completed'])

  return (
      <div className="px-6 py-6">
        <MatchesList matches={matches} />
      </div>
  )
}
