import type { BookingResult } from './types/booking'

const STORAGE_KEY = 'clean_mock_bookings'

export function getStoredBookings(): BookingResult[] {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addBooking(booking: BookingResult): void {
  const existing = getStoredBookings()
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([booking, ...existing]))
}
