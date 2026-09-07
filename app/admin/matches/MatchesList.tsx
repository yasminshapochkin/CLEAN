'use client'
import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { AdminTable } from '@/app/admin/adminTable'
import { BookingRow, BOOKING_TEMPLATE } from '@/app/admin/BookingRow'
import type { BookingResult, BookingStatus } from '@/lib/types/booking'

// "Matches" — bookings a cleaner has accepted (or since completed). A
// booking lands here the moment respondToBooking sets it to 'accepted',
// leaving the separate Booking Requests list (app/admin/bookings).
const TABS: ('all' | BookingStatus)[] = ['all', 'accepted', 'completed']

export function MatchesList({ matches }: { matches: BookingResult[] }) {
  const { t } = useLanguage()
  const [tab, setTab] = useState<'all' | BookingStatus>('all')

  const filtered = tab === 'all' ? matches : matches.filter(m => m.status === tab)

  const columns = [
    { key: 'cleaner', label: t('admin.bookings.cleaner') },
    { key: 'customer', label: t('admin.bookings.customer') },
    { key: 'service', label: t('admin.shared.service') },
    { key: 'dateTime', label: t('admin.bookings.dateTime') },
    { key: 'location', label: t('admin.shared.location') },
    { key: 'status', label: t('admin.shared.status') },
    { key: 'actions', label: '', className: 'text-center' },
  ]

  const toolbar = (
    <div className="flex gap-2 flex-wrap">
      {TABS.map(tabKey => {
        const count = tabKey === 'all' ? matches.length : matches.filter(m => m.status === tabKey).length
        return (
          <button
            key={tabKey}
            type="button"
            onClick={() => setTab(tabKey)}
            className={`text-sm px-3 py-1.5 rounded-full font-semibold transition-colors ${
              tab === tabKey
                ? 'bg-[#75C9C8] text-white shadow-sm'
                : 'bg-white text-gray-600 ring-1 ring-[#DED9E2] hover:bg-[#F7F4EA]'
            }`}
          >
            {t(`admin.matches.tabs.${tabKey}`)} ({count})
          </button>
        )
      })}
    </div>
  )

  return (
    <AdminTable
      title={t('admin.matches.title')}
      toolbar={toolbar}
      columns={columns}
      template={BOOKING_TEMPLATE}
      minWidth="min-w-[860px]"
      isEmpty={filtered.length === 0}
      empty={t('admin.matches.empty')}
    >
      {filtered.map(match => (
        <BookingRow key={match.id} booking={match} />
      ))}
    </AdminTable>
  )
}
