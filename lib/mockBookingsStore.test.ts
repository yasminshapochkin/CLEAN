import { getStoredBookings, addBooking } from './mockBookingsStore'
import type { BookingResult } from './types/booking'

const booking: BookingResult = {
  id: 'new-1',
  cleaner_name: 'Test Cleaner',
  cleaner_avatar_url: null,
  service_type: 'residential',
  scheduled_date: '2026-07-01',
  scheduled_start: '09:00',
  duration_hours: 2,
  address: '1 Test St',
  status: 'pending',
}

describe('mockBookingsStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty array when nothing has been stored', () => {
    expect(getStoredBookings()).toEqual([])
  })

  it('returns a booking after it has been added', () => {
    addBooking(booking)

    expect(getStoredBookings()).toEqual([booking])
  })

  it('prepends newly added bookings so the newest is first', () => {
    addBooking(booking)
    addBooking({ ...booking, id: 'new-2', cleaner_name: 'Another Cleaner' })

    const stored = getStoredBookings()
    expect(stored[0].id).toBe('new-2')
    expect(stored[1].id).toBe('new-1')
  })
})
