import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCleaners, getCustomerLocation } from '@/lib/actions/cleaners'
import { FilterBar } from './FilterBar'
import { CleanerCard } from './CleanerCard'
import type { CleanerFilters } from '@/lib/types/cleaner'

type Props = {
  searchParams: { day?: string; start?: string; end?: string; type?: string }
}

export default async function BrowsePage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const location = await getCustomerLocation(user.id)

  const { day, start, end, type } = searchParams
  const hasFilters = day !== undefined && start !== undefined && end !== undefined && type !== undefined

  const filters: CleanerFilters | null = hasFilters
    ? { day: parseInt(day!), start: start!, end: end!, type: type as CleanerFilters['type'] }
    : null

  const { data: cleaners, error } = filters && location
    ? await getCleaners(filters, location.lat, location.lng)
    : { data: null, error: null }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white px-6 py-3 flex justify-between items-center">
        <span className="font-bold text-lg">✨ Clean</span>
        <div className="flex gap-6 text-sm">
          <Link href="/bookings" className="hover:underline">My Bookings</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
        </div>
      </nav>

      <FilterBar defaultValues={filters ?? undefined} />

      <div className="px-6 py-6">
        {!location && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-sm text-indigo-800 mb-6">
            Please{' '}
            <Link href="/profile" className="font-semibold underline">complete your profile</Link>
            {' '}to see nearby cleaners.
          </div>
        )}

        {error && (
          <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>
        )}

        {!hasFilters && !error && (
          <p className="text-gray-500 text-sm">Use the filters above to find cleaners near you.</p>
        )}

        {hasFilters && !error && cleaners?.length === 0 && (
          <p className="text-gray-500 text-sm">
            No cleaners found for your filters. Try a different day or time.
          </p>
        )}

        {cleaners && cleaners.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-4">{cleaners.length} cleaner{cleaners.length !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cleaners.map(c => <CleanerCard key={c.id} cleaner={c} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
