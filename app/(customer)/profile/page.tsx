// PREVIEW MOCK — remove auth + inject fake data for visual testing. Revert before merging.
import Link from 'next/link'
import { ProfileForm } from './ProfileForm'
import type { CustomerProfile } from '@/lib/types/profile'

const MOCK_PROFILE: CustomerProfile = {
  full_name: 'Maya Cohen',
  phone: '050-1234567',
  bio: 'Looking for a reliable cleaner for my apartment, ideally weekly.',
  preferred_service_type: 'residential',
  address: '12 Rothschild Blvd, Tel Aviv',
}

export default async function ProfilePage() {
  const profile = MOCK_PROFILE

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
        <span className="font-bold text-lg">✨ Clean</span>
        <div className="flex gap-6 text-sm">
          <Link href="/browse" className="hover:underline">Browse Cleaners</Link>
          <Link href="/bookings" className="hover:underline">My Bookings</Link>
          <Link href="/profile" className="font-semibold underline">Profile</Link>
        </div>
      </nav>

      <div className="px-6 py-6">
        <h1 className="text-xl font-bold mb-4">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">My Profile</span>
        </h1>
        <ProfileForm defaultValues={profile} />
      </div>
    </div>
  )
}
