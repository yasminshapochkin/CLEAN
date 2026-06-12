'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const TIME_OF_DAY = [
  { value: 'all_day', label: 'All Day' },
  { value: 'morning', label: 'Morning' },
  { value: 'noon', label: 'Noon' },
  { value: 'evening', label: 'Evening' },
  { value: 'night', label: 'Night' },
]

type Props = {
  defaultValues?: { days?: number[]; timeOfDay?: string; type: string; location?: string }
}

export function FilterBar({ defaultValues }: Props) {
  const router = useRouter()
  const [days, setDays] = useState<number[]>(defaultValues?.days ?? [])
  const [timeOfDay, setTimeOfDay] = useState(defaultValues?.timeOfDay ?? '')
  const [type, setType] = useState(defaultValues?.type ?? '')
  const [location, setLocation] = useState(defaultValues?.location ?? '')

  function toggleDay(i: number) {
    setDays(prev =>
      prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i].sort((a, b) => a - b)
    )
  }

  function toggleAllDays() {
    setDays(prev => (prev.length === DAYS.length ? [] : DAYS.map((_, i) => i)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ type })
    if (days.length > 0) params.set('days', days.join(','))
    if (timeOfDay) params.set('timeOfDay', timeOfDay)
    if (location) params.set('location', location)
    router.push(`/browse?${params}`)
  }

  function handleClear() {
    setDays([])
    setTimeOfDay('')
    setType('')
    setLocation('')
    router.push('/browse')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-end p-4 bg-white border-b border-gray-200 flex-wrap">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Days</span>
        <div className="flex gap-1.5">
          <label className="flex items-center gap-1 text-sm border border-gray-300 rounded-md px-2 py-1.5 cursor-pointer hover:bg-indigo-50 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400">
            <input
              type="checkbox"
              checked={days.length === DAYS.length}
              onChange={toggleAllDays}
              className="accent-indigo-600"
            />
            All Days
          </label>
          {DAYS.map((d, i) => (
            <label
              key={i}
              className="flex items-center gap-1 text-sm border border-gray-300 rounded-md px-2 py-1.5 cursor-pointer hover:bg-indigo-50 has-[:checked]:bg-indigo-100 has-[:checked]:border-indigo-400"
            >
              <input
                type="checkbox"
                checked={days.includes(i)}
                onChange={() => toggleDay(i)}
                className="accent-indigo-600"
              />
              {d}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="timeOfDay" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time of Day</label>
        <select id="timeOfDay" value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} required
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select time</option>
          {TIME_OF_DAY.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="type" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Service Type</label>
        <select id="type" value={type} onChange={e => setType(e.target.value)} required
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select type</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="location" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</label>
        <input id="location" type="text" value={location} onChange={e => setLocation(e.target.value)}
          placeholder="e.g. Tel Aviv"
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="flex gap-2">
        <button type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-semibold text-sm transition-colors">
          Search
        </button>
        <button type="button" onClick={handleClear}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 px-5 py-2 rounded-md font-semibold text-sm transition-colors">
          Clear
        </button>
      </div>
    </form>
  )
}
