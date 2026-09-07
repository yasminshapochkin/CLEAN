'use client'
import { useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import { setSeenStatus } from './actions'

type SeenEntityType = 'cleaner_application' | 'customer_application' | 'booking' | 'support_message'

// A small checkbox for the shared "seen/unseen" worklist (migration
// 0024_admin_seen_items.sql). Manual-only — never auto-checked — and shared
// across admins (checking it off marks the item seen for everyone, like a
// shared todo list). Meant to sit at the very start of a row/card.
export function SeenCheckbox({
  entityType,
  entityId,
  initialSeen,
}: {
  entityType: SeenEntityType
  entityId: string
  initialSeen: boolean
}) {
  const { t } = useLanguage()
  const [seen, setSeen] = useState(initialSeen)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    const next = !seen
    setSeen(next)
    setBusy(true)
    const result = await setSeenStatus(entityType, entityId, next)
    if (result?.error) setSeen(!next)
    setBusy(false)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={seen}
      aria-label={t(seen ? 'admin.shared.markUnseen' : 'admin.shared.markSeen')}
      title={t(seen ? 'admin.shared.markUnseen' : 'admin.shared.markSeen')}
      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors disabled:opacity-60 ${
        seen ? 'bg-[#75C9C8] border-[#75C9C8]' : 'bg-white border-gray-300 hover:border-gray-400'
      }`}
    >
      {seen && (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      )}
    </button>
  )
}
