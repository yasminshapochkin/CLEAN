// PREVIEW MOCK — remove auth + inject fake data for visual testing. Revert before merging.
import Link from 'next/link'
import { FilterBar } from './FilterBar'
import { CleanerCard } from './CleanerCard'
import { filterByLocation, sortCleaners } from '@/lib/cleanerSearch'
import { MOCK_CLEANERS } from '@/lib/mockData/cleaners'

type Props = {
  searchParams: { days?: string; timeOfDay?: string; type?: string; location?: string; sort?: string }
}

export default async function BrowsePage({ searchParams }: Props) {
  const { days, timeOfDay, type, location, sort } = searchParams
  const hasFilters = type !== undefined && timeOfDay !== undefined

  const cleaners = hasFilters ? sortCleaners(filterByLocation(MOCK_CLEANERS, location ?? ''), sort ?? '') : null
  const error = null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 flex justify-between items-center shadow-md">
        <span className="font-bold text-lg">✨ Clean</span>
        <div className="flex gap-6 text-sm">
          <Link href="/bookings" className="hover:underline">My Bookings</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
        </div>
      </nav>

      <FilterBar defaultValues={hasFilters ? { days: days ? days.split(',').map(Number) : [], timeOfDay, type: type!, location, sort } : undefined} />

      <div className="px-6 py-6">
        {error && (
          <p className="text-red-600 text-sm">Something went wrong. Please try again.</p>
        )}

        {!hasFilters && !error && (
          <p className="text-gray-500 text-sm">Use the filters above to find cleaners near you.</p>
        )}

        {hasFilters && !error && cleaners?.length === 0 && (
          <p className="text-gray-500 text-sm">
            No cleaners found for your filters. Try a different day, time, or location.
          </p>
        )}

        {cleaners && cleaners.length > 0 && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-semibold text-indigo-600">{cleaners.length}</span> cleaner{cleaners.length !== 1 ? 's' : ''} found
              {location && <> in <span className="font-semibold text-purple-600">{location}</span></>}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cleaners.map(c => <CleanerCard key={c.id} cleaner={c} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
