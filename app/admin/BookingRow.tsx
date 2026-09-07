'use client'
import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { AdminRow, NameCell, ServiceBadge, StatusPill, TextCell } from './adminTable'
import { PersonCardModal } from './PersonCardModal'
import { BookingDetailCard } from './BookingDetailCard'
import { SeenCheckbox } from './SeenCheckbox'
import type { BookingResult } from '@/lib/types/booking'

// Shared by the Booking Requests and Matches lists — same row shape either
// way, only the surrounding AdminTable (title/tabs/filtering) differs.
// Kept tight enough that the row fits without horizontal scroll on a
// typical admin viewport (same fix already applied to Applications/Cleaners).
// Leading 28px track is the shared admin worklist "seen" checkbox (migration 0024).
export const BOOKING_TEMPLATE =
  '28px minmax(140px,1fr) minmax(140px,1fr) 88px minmax(110px,0.85fr) minmax(100px,0.75fr) 88px 76px'

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Shared search predicate for both Booking Requests and Matches — matches on
// either party's name, the address, or the date (raw YYYY-MM-DD or the
// formatted display date, so "sep" or "2026-09" both work).
export function bookingMatchesSearch(booking: BookingResult, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    booking.cleaner_name.toLowerCase().includes(q) ||
    (booking.customer_name ?? '').toLowerCase().includes(q) ||
    booking.address.toLowerCase().includes(q) ||
    booking.scheduled_date.toLowerCase().includes(q) ||
    formatDate(booking.scheduled_date).toLowerCase().includes(q)
  )
}

type ModalState = 'cleaner' | 'customer' | 'detail' | null

export function BookingRow({ booking }: { booking: BookingResult }) {
  const { t } = useLanguage()
  const [modal, setModal] = useState<ModalState>(null)

  const cells = [
    <SeenCheckbox key="seen" entityType="booking" entityId={booking.id} initialSeen={booking.seen ?? false} />,
    <button key="cl" type="button" onClick={() => setModal('cleaner')} className="min-w-0 block text-start hover:opacity-80 transition-opacity">
      <NameCell name={booking.cleaner_name} url={booking.cleaner_avatar_url} />
    </button>,
    booking.customer_name ? (
      <button key="cu" type="button" onClick={() => setModal('customer')} className="min-w-0 block text-start hover:opacity-80 transition-opacity">
        <NameCell name={booking.customer_name} url={booking.customer_avatar_url ?? null} />
      </button>
    ) : (
      <TextCell key="cu">—</TextCell>
    ),
    <ServiceBadge key="s" types={[booking.service_type]} />,
    <div key="dt" className="text-sm leading-tight">
      <p className="text-gray-700 whitespace-nowrap">{formatDate(booking.scheduled_date)}</p>
      <p className="text-gray-400 whitespace-nowrap">
        {booking.scheduled_start} · {booking.duration_hours}{' '}
        {t(booking.duration_hours !== 1 ? 'bookingCard.hours' : 'bookingCard.hour')}
      </p>
    </div>,
    <TextCell key="l">{booking.address}</TextCell>,
    booking.expired ? (
      <StatusPill key="st" status="expired" label={t('admin.bookings.expiredLabel')} />
    ) : (
      <StatusPill key="st" status={booking.status} label={t(`bookingCard.status.${booking.status}`)} />
    ),
  ]

  const actions = (
    <div className="flex flex-col items-center gap-1 w-full">
      <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide text-center leading-tight">
        {t('admin.bookings.viewBookingRequest')}
      </span>
      <button
        type="button"
        onClick={() => setModal('detail')}
        aria-label={t('admin.bookings.viewBookingRequest')}
        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-[#F7F4EA] hover:text-[#2f7d7c] transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </button>
    </div>
  )

  return (
    <>
      <AdminRow template={BOOKING_TEMPLATE} cells={cells} actions={actions} />
      {modal === 'cleaner' && (
        <PersonCardModal
          role="cleaner"
          name={booking.cleaner_name}
          avatarUrl={booking.cleaner_avatar_url}
          email={booking.cleaner_email}
          phone={booking.cleaner_phone}
          profileHref={booking.cleaner_id ? `/cleaners/${booking.cleaner_id}` : undefined}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'customer' && (
        <PersonCardModal
          role="customer"
          name={booking.customer_name ?? ''}
          avatarUrl={booking.customer_avatar_url ?? null}
          email={booking.customer_email}
          phone={booking.customer_phone}
          onClose={() => setModal(null)}
        />
      )}
      {modal === 'detail' && <BookingDetailCard booking={booking} onClose={() => setModal(null)} />}
    </>
  )
}
