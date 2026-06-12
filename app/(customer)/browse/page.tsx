// PREVIEW MOCK — remove auth + inject fake data for visual testing. Revert before merging.
import Link from 'next/link'
import { FilterBar } from './FilterBar'
import { CleanerCard } from './CleanerCard'
import { filterByLocation, sortCleaners } from '@/lib/cleanerSearch'
import type { CleanerResult } from '@/lib/types/cleaner'

const MOCK_CLEANERS: CleanerResult[] = [
  { id: '1', full_name: 'Sarah M.', avatar_url: null, bio: 'Reliable and thorough. Specialise in deep cleans and move-out cleaning for residential homes.', service_types: ['residential'], hourly_rate: 80, years_experience: 5, languages: ['EN', 'HE'], distance_km: 2.1, area: 'Tel Aviv' },
  { id: '2', full_name: 'David K.', avatar_url: null, bio: 'Expert in office and retail space cleaning. Fully insured and available on short notice.', service_types: ['commercial'], hourly_rate: 95, years_experience: 8, languages: ['EN', 'AR'], distance_km: 4.7, area: 'Haifa' },
  { id: '3', full_name: 'Lena R.', avatar_url: null, bio: 'Friendly and detail-oriented. Available most weekdays. Eco-friendly products on request.', service_types: ['residential', 'commercial'], hourly_rate: 70, years_experience: 3, languages: ['RU', 'HE'], distance_km: 1.3, area: 'Tel Aviv' },
  { id: '4', full_name: 'Moshe T.', avatar_url: null, bio: 'Professional cleaner with a focus on post-construction and deep cleaning services.', service_types: ['residential'], hourly_rate: 85, years_experience: 6, languages: ['HE'], distance_km: 3.5, area: 'Ramat Gan' },
  { id: '5', full_name: 'Anna P.', avatar_url: null, bio: 'Experienced in both homes and small offices. References available upon request.', service_types: ['residential', 'commercial'], hourly_rate: 75, years_experience: 4, languages: ['RU', 'EN'], distance_km: 0.8, area: 'Tel Aviv' },
  { id: '6', full_name: 'Yosef B.', avatar_url: null, bio: 'Specialise in large commercial spaces. Background-checked and professionally trained.', service_types: ['commercial'], hourly_rate: 100, years_experience: 10, languages: ['HE', 'EN'], distance_km: 6.2, area: 'Herzliya' },
]

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
