import { filterByLocation } from './cleanerSearch'
import type { CleanerResult } from './types/cleaner'

const cleaners: CleanerResult[] = [
  { id: '1', full_name: 'Sarah M.', avatar_url: null, bio: '', service_types: ['residential'], hourly_rate: 80, years_experience: 5, languages: [], distance_km: 2.1, area: 'Tel Aviv' },
  { id: '2', full_name: 'David K.', avatar_url: null, bio: '', service_types: ['commercial'], hourly_rate: 95, years_experience: 8, languages: [], distance_km: 4.7, area: 'Haifa' },
  { id: '3', full_name: 'Lena R.', avatar_url: null, bio: '', service_types: ['residential'], hourly_rate: 70, years_experience: 3, languages: [], distance_km: 1.3, area: 'Tel Aviv' },
]

describe('filterByLocation', () => {
  it('returns all cleaners when location is empty', () => {
    expect(filterByLocation(cleaners, '')).toEqual(cleaners)
  })

  it('returns only cleaners whose area matches (case-insensitive)', () => {
    const result = filterByLocation(cleaners, 'tel aviv')

    expect(result).toEqual([cleaners[0], cleaners[2]])
  })

  it('returns an empty array when no cleaners match', () => {
    expect(filterByLocation(cleaners, 'Jerusalem')).toEqual([])
  })
})
