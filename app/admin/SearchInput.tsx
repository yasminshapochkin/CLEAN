'use client'
import { useLanguage } from '@/lib/i18n/LanguageContext'

// Shared client-side search box for the admin list toolbars — filters the
// already-fetched rows in place (no server round-trip), matched against
// whatever fields each list decides are searchable (name/date/location).
export function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { t } = useLanguage()
  return (
    <div className="relative">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3 text-gray-400 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('admin.shared.searchPlaceholder')}
        aria-label={t('admin.shared.search')}
        className="text-sm border border-gray-200 rounded-lg ps-9 pe-3 py-1.5 bg-white text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#75C9C8] w-full sm:w-64"
      />
    </div>
  )
}
