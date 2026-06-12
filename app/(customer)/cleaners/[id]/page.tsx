// PREVIEW MOCK — remove auth + inject fake data for visual testing. Revert before merging.
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CleanerProfile } from './CleanerProfile'
import { MOCK_CLEANERS } from '@/lib/mockData/cleaners'

type Props = {
  params: { id: string }
}

export default async function CleanerProfilePage({ params }: Props) {
  const cleaner = MOCK_CLEANERS.find(c => c.id === params.id)

  if (!cleaner) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
        <span className="font-bold text-lg">✨ Clean</span>
        <div className="flex gap-6 text-sm">
          <Link href="/browse" className="hover:underline">Browse Cleaners</Link>
          <Link href="/bookings" className="hover:underline">My Bookings</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
        </div>
      </nav>

      <div className="px-6 py-6">
        <CleanerProfile cleaner={cleaner} />
      </div>
    </div>
  )
}
