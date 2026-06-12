'use client'
import { useState } from 'react'
import type { CustomerProfile } from '@/lib/types/profile'

type Props = {
  defaultValues: CustomerProfile
  onSave?: (profile: CustomerProfile) => void
}

export function ProfileForm({ defaultValues, onSave }: Props) {
  const [fullName, setFullName] = useState(defaultValues.full_name)
  const [phone, setPhone] = useState(defaultValues.phone)
  const [bio, setBio] = useState(defaultValues.bio)
  const [preferredServiceType, setPreferredServiceType] = useState(defaultValues.preferred_service_type)
  const [address, setAddress] = useState(defaultValues.address)
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave?.({
      full_name: fullName,
      phone,
      bio,
      preferred_service_type: preferredServiceType,
      address,
    })
    setSaved(true)
  }

  const fieldClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full'
  const labelClass = 'text-xs font-semibold text-gray-500 uppercase tracking-wide'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex flex-col gap-4 max-w-lg">
      <div className="flex flex-col gap-1">
        <label htmlFor="full_name" className={labelClass}>Full Name</label>
        <input id="full_name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className={fieldClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="phone" className={labelClass}>Phone</label>
        <input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={fieldClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="bio" className={labelClass}>Bio</label>
        <textarea id="bio" rows={3} value={bio} onChange={e => setBio(e.target.value)} className={`${fieldClass} resize-none`} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="preferred_service_type" className={labelClass}>Preferred Service Type</label>
        <select
          id="preferred_service_type"
          value={preferredServiceType}
          onChange={e => setPreferredServiceType(e.target.value as CustomerProfile['preferred_service_type'])}
          className={fieldClass}
        >
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="address" className={labelClass}>Address</label>
        <input id="address" type="text" value={address} onChange={e => setAddress(e.target.value)} required className={fieldClass} />
        <p className="text-xs text-gray-400">Used to match you with nearby cleaners.</p>
      </div>

      {saved && (
        <p className="text-sm text-green-700 bg-green-50 rounded-md px-3 py-2">Profile updated.</p>
      )}

      <button type="submit"
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-semibold text-sm transition-colors self-start">
        Save Changes
      </button>
    </form>
  )
}
