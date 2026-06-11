'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const TIMES = Array.from({ length: 33 }, (_, i) => {
  const totalMinutes = 360 + i * 30
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const m = String(totalMinutes % 60).padStart(2, '0')
  return `${h}:${m}`
})

type Props = {
  defaultValues?: { day: number; start: string; end: string; type: string }
}

export function FilterBar({ defaultValues }: Props) {
  const router = useRouter()
  const [day, setDay] = useState(defaultValues?.day != null ? String(defaultValues.day) : '')
  const [start, setStart] = useState(defaultValues?.start ?? '')
  const [end, setEnd] = useState(defaultValues?.end ?? '')
  const [type, setType] = useState(defaultValues?.type ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ day, start, end, type })
    router.push(`/browse?${params}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 items-end p-4 bg-white border-b border-gray-200">
      <div className="flex flex-col gap-1">
        <label htmlFor="day" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Day</label>
        <select id="day" value={day} onChange={e => setDay(e.target.value)} required
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select day</option>
          {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="start" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Start Time</label>
        <select id="start" value={start} onChange={e => setStart(e.target.value)} required
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select time</option>
          {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="end" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">End Time</label>
        <select id="end" value={end} onChange={e => setEnd(e.target.value)} required
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Select time</option>
          {TIMES.filter(t => !start || t > start).map(t => <option key={t} value={t}>{t}</option>)}
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

      <button type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-semibold text-sm transition-colors">
        Search
      </button>
    </form>
  )
}
