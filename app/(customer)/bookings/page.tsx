// PREVIEW MOCK — remove auth + inject fake data for visual testing. Revert before merging.
import Link from 'next/link'
import { BookingCard } from './BookingCard'
import type { BookingResult } from '@/lib/types/booking'

const MOCK_BOOKINGS: BookingResult[] = [
  {
    id: '1',
    cleaner_name: 'Sarah M.',
    cleaner_avatar_url: null,
    service_type: 'residential',
    scheduled_date: '2026-06-15',
    scheduled_start: '09:00',
    duration_hours: 3,
    address: '12 Rothschild Blvd, Tel Aviv',
    notes: 'Please bring eco-friendly products if possible.',
    status: 'pending',
  },
  {
    id: '2',
    cleaner_name: 'David K.',
    cleaner_avatar_url: null,
    service_type: 'commercial',
    scheduled_date: '2026-06-18',
    scheduled_start: '14:00',
    duration_hours: 4,
    address: '8 HaArba\'a St, Tel Aviv',
    status: 'accepted',
  },
  {
    id: '3',
    cleaner_name: 'Lena R.',
    cleaner_avatar_url: null,
    service_type: 'residential',
    scheduled_date: '2026-06-05',
    scheduled_start: '10:00',
    duration_hours: 2,
    address: '45 Dizengoff St, Tel Aviv',
    status: 'completed',
  },
  {
    id: '4',
    cleaner_name: 'Yosef B.',
    cleaner_avatar_url: null,
    service_type: 'commercial',
    scheduled_date: '2026-06-02',
    scheduled_start: '08:00',
    duration_hours: 5,
    address: '3 Herzl St, Herzliya',
    status: 'declined',
  },
  {
    id: '5',
    cleaner_name: 'Anna P.',
    cleaner_avatar_url: null,
    service_type: 'residential',
    scheduled_date: '2026-05-28',
    scheduled_start: '11:00',
    duration_hours: 1,
    address: '20 Allenby St, Tel Aviv',
    status: 'cancelled',
  },
]

export default async function BookingsPage() {
  const bookings = MOCK_BOOKINGS
  const error = null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
        <span className="font-bold text-lg">✨ Clean</span>
        <div className="flex gap-6 text-sm">
          <Link href="/browse" className="hover:underline">Browse Cleaners</Link>
          <Link href="/bookings" className="font-semibold underline">My Bookings</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
        </div>
      </nav>

      <div className="px-6 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-4">My Bookings</h1>

        {error && (
          <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>
        )}

        {!error && bookings.length === 0 && (
          <p className="text-gray-500 text-sm">
            You don't have any bookings yet.{' '}
            <Link href="/browse" className="text-indigo-600 font-semibold hover:underline">
              Browse cleaners
            </Link>{' '}
            to send your first request.
          </p>
        )}

        {bookings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookings.map(b => <BookingCard key={b.id} booking={b} />)}
          </div>
        )}
      </div>
    </div>
  )
}
