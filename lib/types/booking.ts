export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled'

export type BookingResult = {
  id: string
  cleaner_name: string
  cleaner_avatar_url: string | null
  service_type: 'residential' | 'commercial'
  scheduled_date: string // 'YYYY-MM-DD'
  scheduled_start: string // 'HH:MM'
  duration_hours: number
  address: string
  notes?: string
  status: BookingStatus
}
