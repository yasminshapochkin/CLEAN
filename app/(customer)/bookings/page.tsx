// PREVIEW MOCK — remove auth + inject fake data for visual testing. Revert before merging.
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookingCard } from './BookingCard'
import { MOCK_BOOKINGS } from '@/lib/mockData/bookings'
import { getStoredBookings } from '@/lib/mockBookingsStore'
import type { BookingResult } from '@/lib/types/booking'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingResult[]>(MOCK_BOOKINGS)

  useEffect(() => {
    setBookings([...getStoredBookings(), ...MOCK_BOOKINGS])
  }, [])

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
