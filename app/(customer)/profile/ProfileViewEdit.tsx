"use client"

import { useState } from "react"
import ProfileView from "./ProfileView"
import { ProfileForm } from "./ProfileForm"
import type { ReviewItem } from "@/components/HostProfileReviews"
import type { Customer } from "@/types/database"

type ActionResult = { error?: string; success?: boolean; avatarUrl?: string; petPhotoUrl?: string } | null

type DefaultValues = React.ComponentProps<typeof ProfileForm>["defaultValues"]

// Mirrors the cleaner side's ProfileViewEdit: defaults to the read-only
// "how others see you" card, switching to the editable form and back on
// save — so a host's own profile only looks different from what a cleaner
// sees while they're actively editing it.
export default function ProfileViewEdit({
  fullName,
  avatarUrl,
  customer,
  reviews,
  defaultValues,
  action,
}: {
  fullName: string
  avatarUrl: string | null
  customer: Customer | null
  reviews: ReviewItem[]
  defaultValues: DefaultValues
  action: (state: ActionResult, formData: FormData) => Promise<ActionResult>
}) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return <ProfileForm defaultValues={defaultValues} action={action} onSaved={() => setEditing(false)} />
  }
  return (
    <ProfileView
      fullName={fullName}
      avatarUrl={avatarUrl}
      customer={customer}
      reviews={reviews}
      onEdit={() => setEditing(true)}
    />
  )
}
