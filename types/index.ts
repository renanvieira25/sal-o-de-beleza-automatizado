export type UserRole = 'admin' | 'autonoma'
export type BookingType = 'hourly' | 'daily' | 'weekly' | 'monthly'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'late_cancelled' | 'completed'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  role: UserRole
  specialty: string | null
  avatar_url: string | null
  created_at: string
}

export interface Space {
  id: string
  name: string
  description: string | null
  amenities: string[]
  is_active: boolean
  created_at: string
}

export interface Pricing {
  id: string
  booking_type: BookingType
  price_per_unit: number
  unit_label: string
  is_active: boolean
  updated_at: string
}

export interface Booking {
  id: string
  space_id: string
  user_id: string
  start_datetime: string
  end_datetime: string
  booking_type: BookingType
  status: BookingStatus
  total_price: number
  notes: string | null
  created_at: string
  space?: Space
  profile?: Profile
}

export interface BlockedPeriod {
  id: string
  space_id: string | null
  start_datetime: string
  end_datetime: string
  reason: string | null
  created_at: string
}

export const BOOKING_TYPE_LABELS: Record<BookingType, string> = {
  hourly: 'Por hora',
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Aguardando confirmação',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  late_cancelled: 'Cancelamento tardio',
  completed: 'Concluída',
}
