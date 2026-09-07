'use client'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { Avatar } from './adminTable'

// A lightweight popup profile card — used from the Booking Requests/Matches
// lists so tapping either party's name doesn't navigate away from the row's
// context. Cleaners additionally get a link to their real public profile
// (/cleaners/[id], admin-readable per middleware.ts); customers have no
// such page, so this card is the whole of what admin sees for them.
export function PersonCardModal({
  role,
  name,
  avatarUrl,
  email,
  phone,
  profileHref,
  onClose,
}: {
  role: 'cleaner' | 'customer'
  name: string
  avatarUrl: string | null
  email?: string
  phone?: string
  profileHref?: string
  onClose: () => void
}) {
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t(`admin.bookings.role.${role}`)}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('admin.shared.close')}
            className="text-xl text-gray-400 hover:text-gray-700 font-bold leading-none"
          >
            ✕
          </button>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <Avatar name={name} url={avatarUrl} />
          <p className="font-bold text-lg text-gray-900 min-w-0 truncate">{name || '—'}</p>
        </div>

        <div className="space-y-2.5 text-sm">
          {email && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-400 shrink-0">{t('admin.shared.email')}</span>
              <span className="text-gray-700 break-all text-end">{email}</span>
            </div>
          )}
          {phone && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-400 shrink-0">{t('admin.shared.phone')}</span>
              <span className="text-gray-700" dir="ltr">{phone}</span>
            </div>
          )}
          {!email && !phone && <p className="text-gray-300 text-center">{t('admin.shared.none')}</p>}
        </div>

        {profileHref && (
          <a
            href={profileHref}
            className="mt-5 block text-center text-sm font-semibold text-[#43629e] hover:underline"
          >
            {t('admin.bookings.viewProfile')}
          </a>
        )}
      </div>
    </div>
  )
}
