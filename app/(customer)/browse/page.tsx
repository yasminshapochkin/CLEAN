// PREVIEW MOCK — remove auth + inject fake data for visual testing. Revert before merging.
import Link from 'next/link'
import { FilterBar } from './FilterBar'
import { CleanerCard } from './CleanerCard'
import type { CleanerFilters, CleanerResult } from '@/lib/types/cleaner'

const MOCK_CLEANERS: CleanerResult[] = [
  { id: '1', full_name: 'Sarah M.', avatar_url: null, bio: 'Reliable and thorough. Specialise in deep cleans and move-out cleaning for residential homes.', service_types: ['residential'], hourly_rate: 80, years_experience: 5, languages: ['EN', 'HE'], distance_km: 2.1 },
  { id: '2', full_name: 'David K.', avatar_url: null, bio: 'Expert in office and retail space cleaning. Fully insured and available on short notice.', service_types: ['commercial'], hourly_rate: 95, years_experience: 8, languages: ['EN', 'AR'], distance_km: 4.7 },
  { id: '3', full_name: 'Lena R.', avatar_url: null, bio: 'Friendly and detail-oriented. Available most weekdays. Eco-friendly products on request.', service_types: ['residential', 'commercial'], hourly_rate: 70, years_experience: 3, languages: ['RU', 'HE'], distance_km: 1.3 },
  { id: '4', full_name: 'Moshe T.', avatar_url: null, bio: 'Professional cleaner with a focus on post-construction and deep cleaning services.', service_types: ['residential'], hourly_rate: 85, years_experience: 6, languages: ['HE'], distance_km: 3.5 },
  { id: '5', full_name: 'Anna P.', avatar_url: null, bio: 'Experienced in both homes and small offices. References available upon request.', service_types: ['residential', 'commercial'], hourly_rate: 75, years_experience: 4, languages: ['RU', 'EN'], distance_km: 0.8 },
  { id: '6', full_name: 'Yosef B.', avatar_url: null, bio: 'Specialise in large commercial spaces. Background-checked and professionally trained.', service_types: ['commercial'], hourly_rate: 100, years_experience: 10, languages: ['HE', 'EN'], distance_km: 6.2 },
]

type Props = {
  searchParams: { day?: string; start?: string; end?: string; type?: string }
}

export default async function BrowsePage({ searchParams }: Props) {
  const { day, start, end, type } = searchParams
  const hasFilters = day !== undefined && start !== undefined && end !== undefined && type !== undefined

  const filters: CleanerFilters | null = hasFilters
    ? { day: parseInt(day!), start: start!, end: end!, type: type as CleanerFilters['type'] }
    : null

  const cleaners = hasFilters ? MOCK_CLEANERS : null
  const error = null
  const location = true

  return (
    <div className="min-h-screen bg-indigo-50">
      <nav className="bg-indigo-600 text-white px-6 py-3 flex justify-between items-center">
        <span className="font-bold text-lg">✨ Clean</span>
        <div className="flex gap-6 text-sm">
          <Link href="/bookings" className="hover:underline">My Bookings</Link>
          <Link href="/profile" className="hover:underline">Profile</Link>
        </div>
      </nav>

      <FilterBar defaultValues={filters ?? undefined} />

      <div className="px-6 py-6">
        {/* location banner hidden in mock mode */}

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
