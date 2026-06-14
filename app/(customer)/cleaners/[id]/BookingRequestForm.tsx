'use client'
import { useState } from 'react'
import { addBooking } from '@/lib/mockBookingsStore'
import type { CleanerResult } from '@/lib/types/cleaner'
import type { BookingResult } from '@/lib/types/booking'

const DURATIONS = [1, 2, 3, 4, 5, 6, 7, 8]

export function BookingRequestForm({ cleaner }: { cleaner: CleanerResult }) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serviceType, setServiceType] = useState(cleaner.service_types[0] ?? 'residential')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [duration, setDuration] = useState(2)
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const booking: BookingResult = {
      id: `${cleaner.id}-${Date.now()}`,
      cleaner_name: cleaner.full_name,
      cleaner_avatar_url: cleaner.avatar_url,
      service_type: serviceType as BookingResult['service_type'],
      scheduled_date: date,
      scheduled_start: startTime,
      duration_hours: duration,
      address,
      notes: notes || undefined,
      status: 'pending',
    }
    addBooking(booking)

    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="pt-4 border-t border-gray-100 text-center">
        <p className="text-green-700 font-semibold">✅ Booking request sent to {cleaner.full_name}!</p>
        <p className="text-sm text-gray-500 mt-1">They'll respond within 24 hours.</p>
      </div>
    )
  }

  if (!open) {
    return (
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <span className="text-lg font-bold text-gray-900">₪{cleaner.hourly_rate}/hr</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Request Booking
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="pt-4 border-t border-gray-100 flex flex-col gap-3">
      <h2 className="font-bold text-gray-900">Request a Booking</h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="serviceType" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Type</label>
        <select id="serviceType" value={serviceType} onChange={e => setServiceType(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {cleaner.service_types.map(t => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="date" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</label>
          <input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label htmlFor="startTime" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Time</label>
          <input id="startTime" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="duration" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration (hrs)</label>
          <select id="duration" value={duration} onChange={e => setDuration(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</label>
        <input id="address" type="text" value={address} onChange={e => setAddress(e.target.value)} required
          placeholder="e.g. 12 Rothschild Blvd, Tel Aviv"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="notes" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes (optional)</label>
        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Anything the cleaner should know?"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={() => setOpen(false)}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-5 py-2 rounded-md font-semibold text-sm transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
          Send Request
        </button>
      </div>
    </form>
  )
}
