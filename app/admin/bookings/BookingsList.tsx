'use client'
import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { AdminTable } from '@/app/admin/adminTable'
import { BookingRow, BOOKING_TEMPLATE, bookingMatchesSearch } from '@/app/admin/BookingRow'
import { SearchInput } from '@/app/admin/SearchInput'
import type { BookingResult, BookingStatus } from '@/lib/types/booking'

// "Booking Requests" — every booking that hasn't (or didn't) turn into a
// match: pending, declined, cancelled. Once a cleaner accepts, it moves to
// the separate Matches list (app/admin/matches) instead of showing here.
// "Expired" is a display-only pseudo-tab (see BookingResult.expired) — a
// pending request whose own scheduled_date has passed; "Pending" excludes
// those so it only ever shows genuinely still-live requests.
type Tab = 'all' | BookingStatus | 'expired'
const TABS: Tab[] = ['all', 'pending', 'expired', 'declined', 'cancelled']

function matchesTab(booking: BookingResult, tab: Tab): boolean {
  if (tab === 'all') return true
  if (tab === 'expired') return !!booking.expired
  if (tab === 'pending') return booking.status === 'pending' && !booking.expired
  return booking.status === tab
}

export function BookingsList({ bookings }: { bookings: BookingResult[] }) {
  const { t } = useLanguage()
  const [tab, setTab] = useState<Tab>('pending')
  const [search, setSearch] = useState('')

  const filtered = bookings.filter(b => matchesTab(b, tab) && bookingMatchesSearch(b, search))

  const columns = [
    { key: 'seen', label: '' },
    { key: 'cleaner', label: t('admin.bookings.cleaner') },
    { key: 'customer', label: t('admin.bookings.customer') },
    { key: 'service', label: t('admin.shared.service') },
    { key: 'dateTime', label: t('admin.bookings.dateTime') },
    { key: 'location', label: t('admin.shared.location') },
    { key: 'status', label: t('admin.shared.status') },
    { key: 'actions', label: '', className: 'text-center' },
  ]

  const toolbar = (
    <div className="flex flex-col items-end gap-2">
      <SearchInput value={search} onChange={setSearch} />
      <div className="flex gap-2 flex-wrap justify-end">
        {TABS.map(tabKey => {
          const count = bookings.filter(b => matchesTab(b, tabKey)).length
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
              {t(`admin.bookings.tabs.${tabKey}`)} ({count})
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <AdminTable
      title={t('admin.bookings.title')}
      toolbar={toolbar}
      columns={columns}
      template={BOOKING_TEMPLATE}
      minWidth="min-w-[890px]"
      isEmpty={filtered.length === 0}
      empty={t('admin.bookings.empty')}
    >
      {filtered.map(booking => (
        <BookingRow key={booking.id} booking={booking} />
      ))}
    </AdminTable>
  )
}
