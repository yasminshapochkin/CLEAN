import type { CleanerResult } from './types/cleaner'

export function filterByLocation(cleaners: CleanerResult[], location: string): CleanerResult[] {
  if (!location.trim()) return cleaners

  const query = location.trim().toLowerCase()
  return cleaners.filter(c => c.area?.toLowerCase().includes(query))
}
